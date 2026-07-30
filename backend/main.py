import hashlib
import os
import re
import shutil
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_anthropic import ChatAnthropic
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel

# Load environment variables from backend/.env (local) or Space secrets (HF)
_BASE_DIR = Path(__file__).resolve().parent
_ENV_PATH = _BASE_DIR / ".env"
load_dotenv(_ENV_PATH)
os.environ["TOKENIZERS_PARALLELISM"] = "false"

DATA_DIR = _BASE_DIR / "data"
PERSIST_DIR = _BASE_DIR / "chroma_db"
HASH_FILE = PERSIST_DIR / "data_hash.txt"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_chain = None
_embedding_model = None


def _data_content_hash() -> str:
    """Stable hash of all PDF/TXT files under data/ so resume updates trigger reindex."""
    digest = hashlib.sha256()
    if not DATA_DIR.is_dir():
        return digest.hexdigest()
    for path in sorted(DATA_DIR.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".pdf", ".txt", ".md"}:
            continue
        digest.update(path.name.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def _read_stored_hash() -> str | None:
    if HASH_FILE.is_file():
        return HASH_FILE.read_text(encoding="utf-8").strip() or None
    return None


def _write_stored_hash(value: str) -> None:
    PERSIST_DIR.mkdir(parents=True, exist_ok=True)
    HASH_FILE.write_text(value, encoding="utf-8")


def _collection_name(embedding_dim: int) -> str:
    safe_model_tag = re.sub(r"[^a-zA-Z0-9_-]+", "-", EMBEDDING_MODEL_NAME.split("/")[-1])
    return f"portfolio_{safe_model_tag}_{embedding_dim or 'dim'}_v2"


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("   1. Initializing embedding model (all-MiniLM-L6-v2)...")
        _embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embedding_model


def _load_documents() -> list[Document]:
    if not DATA_DIR.is_dir():
        raise RuntimeError(f"Data directory missing: {DATA_DIR}")

    pdf_loader = DirectoryLoader(
        str(DATA_DIR),
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=False,
    )
    txt_loader = DirectoryLoader(
        str(DATA_DIR),
        glob="**/*.txt",
        loader_cls=TextLoader,
        show_progress=False,
    )
    docs = pdf_loader.load() + txt_loader.load()
    print(f"   ✅ Loaded {len(docs)} documents from {DATA_DIR}")
    return docs


def _split_documents(docs: list[Document]) -> list[Document]:
    """Section-aware chunking tuned for resume + portfolio narrative text."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=[
            "\n\nWORK EXPERIENCE",
            "\n\nPROJECTS",
            "\n\nSKILLS",
            "\n\nEDUCATION",
            "\n\nFRONTEND PROFILE",
            "\n\n",
            "\n• ",
            "\n",
            ". ",
            " ",
            "",
        ],
    )
    splits = splitter.split_documents(docs)
    print(f"   ✅ Created {len(splits)} document chunks.")
    return splits


def _build_vectorstore(embedding_model, collection_name: str):
    print("   → Building vector store from data/ ...")
    docs = _load_documents()
    if not docs:
        raise RuntimeError(f"No PDF/TXT documents found in {DATA_DIR}")
    splits = _split_documents(docs)

    if PERSIST_DIR.exists():
        shutil.rmtree(PERSIST_DIR)
    PERSIST_DIR.mkdir(parents=True, exist_ok=True)

    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embedding_model,
        collection_name=collection_name,
        persist_directory=str(PERSIST_DIR),
    )
    print("   ✅ Vector store ready.")
    return vectorstore


def _load_or_build_vectorstore(force: bool = False):
    embedding_model = _get_embedding_model()
    try:
        test_dim = len(embedding_model.embed_query("dimension probe"))
    except Exception:
        test_dim = 0
    collection_name = _collection_name(test_dim)

    current_hash = _data_content_hash()
    stored_hash = _read_stored_hash()
    needs_rebuild = force or stored_hash != current_hash

    vectorstore = None
    if not needs_rebuild and PERSIST_DIR.is_dir() and any(PERSIST_DIR.iterdir()):
        try:
            print("   2. Loading existing Chroma store...")
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=embedding_model,
                persist_directory=str(PERSIST_DIR),
            )
            count = vectorstore._collection.count()  # type: ignore[attr-defined]
            if not count:
                needs_rebuild = True
                print("   ℹ️ Collection empty; will rebuild.")
            else:
                print(f"   ✅ Collection has {count} vectors (hash match).")
        except Exception as e:
            print(f"   ⚠️ Failed to load vector store, rebuilding: {e}")
            needs_rebuild = True
    else:
        if stored_hash != current_hash:
            print("   2. Data hash changed — rebuilding vector store...")
        else:
            print("   2. No usable vector store — building...")
        needs_rebuild = True

    if needs_rebuild:
        vectorstore = _build_vectorstore(embedding_model, collection_name)
        _write_stored_hash(current_hash)

    return vectorstore


def _build_llm():
    print("   3. Initializing LLM (Claude Haiku by default)...")
    api_key = (os.getenv("ANTHROPIC_API_KEY") or "").strip().strip('"').strip("'")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is missing. Add it to backend/.env locally, "
            "or as a Hugging Face Space secret named ANTHROPIC_API_KEY."
        )

    model_name = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5")
    model_aliases = {
        "claude-3-haiku-latest": "claude-haiku-4-5",
        "claude-3-haiku-20240307": "claude-haiku-4-5",
        "haiku-latest": "claude-haiku-4-5",
        "haiku": "claude-haiku-4-5",
        "claude-3-sonnet-latest": "claude-sonnet-5",
        "sonnet-latest": "claude-sonnet-5",
        "sonnet": "claude-sonnet-5",
        "claude-3-opus-latest": "claude-opus-5",
        "opus-latest": "claude-opus-5",
        "opus": "claude-opus-5",
        "claude-3-5-sonnet-latest": "claude-sonnet-5",
        "sonnet-3.5-latest": "claude-sonnet-5",
    }
    model_name = model_aliases.get(model_name, model_name)
    llm = ChatAnthropic(
        model=model_name,
        api_key=api_key,
        temperature=0.15,
        max_tokens=450,
    )
    print(f"   ✅ LLM initialized: {model_name}")
    return llm


CONTACT_FACTS = (
    "CONTACT INFORMATION:\n"
    "Email: viditivartak08@gmail.com\n"
    "Phone: +1 (657) 525-8975\n"
    "Location: San Jose, California\n"
    "LinkedIn: https://linkedin.com/in/viditivartak\n"
    "Portfolio: https://viditivartak.netlify.app\n"
    "GitHub: https://github.com/viditi08"
)

PROFILE_FACTS = (
    "PROFILE:\n"
    "Name: Viditi Vartak\n"
    "Role: Software Engineer (product experiences — UI + systems)\n"
    "Location: San Jose, CA\n"
    "Elevator pitch (use for 30-second / pitch / introduce yourself — EXPERIENCE only, not side projects):\n"
    "I'm Viditi Vartak, a software engineer in San Jose. I've shipped product experiences across "
    "Saayam For All (Vue donor dashboards and component libraries), DentalScan (React/TypeScript clinic "
    "tools with live WebSocket updates), and LendAPI (a React drag-and-drop loan application builder). "
    "Earlier, I built React insurance ops UIs at BusinessLab and mobile-friendly React features at Nibodh "
    "for 5,000+ users. I care about clear UX and reliable delivery with the teams behind the product.\n"
    "Design philosophy (NOT the elevator pitch — only if asked about design/UX mindset or Nibodh):\n"
    "I design interfaces that users actually want to use—bridging the gap between beautiful design and functional code. "
    "At Nibodh, I built React-based mobile UIs serving 5,000+ users, learning firsthand how design choices drive engagement. "
    "I combine that user-first mindset with scalable backend systems to create seamless, end-to-end experiences.\n"
    "Strengths: React, Vue.js, Next.js, TypeScript; APIs; FastAPI/Node; end-to-end delivery\n"
    "Priority: talk about WORK EXPERIENCE (Saayam, DentalScan, LendAPI, BusinessLab, Nibodh) before projects "
    "unless the user explicitly asks about projects."
)

# Expand short / vague queries so retrieval hits the right resume sections
_QUERY_EXPAND = [
    (re.compile(r"\b(contact|email|phone|reach|linkedin|hire me|get in touch)\b", re.I),
     " contact email phone LinkedIn location portfolio GitHub"),
    (re.compile(r"\b(pitch|about you|who are you|introduce|elevator|journey|career)\b", re.I),
     " elevator pitch work experience Saayam DentalScan LendAPI BusinessLab Nibodh Jiya career arc"),
    (re.compile(r"\b(summary|summarize|experience|work history|roles|jobs|story|stories)\b", re.I),
     " work experience stories Saayam DentalScan LendAPI BusinessLab Nibodh Jiya Nutraherbs"),
    (re.compile(r"\b(certif|aws|databricks|oracle|power bi|ghc|grace hopper|education|master|csuf|mumbai)\b", re.I),
     " certifications AWS Databricks Oracle Power BI education CSUF Mumbai GHC Grace Hopper"),
    (re.compile(r"\b(stack|skills|technologies|tech|tools)\b", re.I),
     " skills React Vue Next.js TypeScript Tailwind WebSockets FastAPI"),
    (re.compile(r"\b(saayam|donor)\b", re.I),
     " Saayam Vue.js dashboard component library donations"),
    (re.compile(r"\b(dental|clinic)\b", re.I),
     " DentalScan React TypeScript WebSocket patient dashboard"),
    (re.compile(r"\b(lendapi|lend|loan)\b", re.I),
     " LendAPI React drag-and-drop loan application builder"),
    (re.compile(r"\b(emma|therapist)\b", re.I),
     " Emma AI Therapist Next.js TypeScript WebSockets Gemini"),
    (re.compile(r"\b(experience|work history|roles|jobs)\b", re.I),
     " work experience Saayam DentalScan LendAPI BusinessLab Nibodh"),
]


def _expand_query(question: str) -> str:
    extra = []
    for pattern, suffix in _QUERY_EXPAND:
        if pattern.search(question):
            extra.append(suffix)
    if not extra:
        return question
    # de-dupe while preserving order
    seen = set()
    parts = [question]
    for chunk in extra:
        if chunk not in seen:
            seen.add(chunk)
            parts.append(chunk)
    return " ".join(parts)


def _format_docs(docs: list[Document]) -> str:
    body = "\n\n".join(doc.page_content for doc in docs)
    return f"{PROFILE_FACTS}\n\n{CONTACT_FACTS}\n\nRETRIEVED CONTEXT:\n{body}"


def _build_rag_chain(vectorstore):
    print("   4. Creating smart frontend RAG chain (MMR + LCEL)...")
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 4, "fetch_k": 14, "lambda_mult": 0.5},
    )
    llm = _build_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "You answer as Viditi Vartak in first person — a software engineer who ships product "
                    "experiences (UI + the systems behind them). Be natural and recruiter-friendly. "
                    "Do NOT overuse the word 'frontend' or repeat 'Frontend Engineer' in every answer.\n\n"
                    "Match the question:\n"
                    "- Elevator / 30-second pitch / introduce yourself: Use the Elevator pitch from PROFILE "
                    "(experience at Saayam, DentalScan, LendAPI, BusinessLab, Nibodh). Do NOT lead with side "
                    "projects (Emma, portfolio chatbot, WhatsApp Chat Analyzer) unless asked. "
                    "Do NOT use Design philosophy. Do NOT say 'bridges design, data, and AI' or lead with "
                    "Databricks / NLP tools in the pitch. Do NOT spam the word 'frontend'.\n"
                    "- Experience / roles / work history / journey / stories: prioritize companies and impact "
                    "(Saayam, DentalScan, LendAPI, BusinessLab, Jiya, Nibodh); mention projects only if asked.\n"
                    "- Certifications / education / GHC / community: use EDUCATION & GROWTH / CERTIFICATIONS facts "
                    "(AWS, Databricks, Oracle, Power BI, CSUF, Mumbai, Grace Hopper, AWT).\n"
                    "- Design / UI mindset / Nibodh engagement: use Design philosophy from PROFILE.\n"
                    "- Stack / skills: short bullets of tools actually in context.\n"
                    "- Contact: email, phone, LinkedIn, location, portfolio. Never say contact is missing.\n"
                    "- Deep technical questions: concise bullets on architecture, tradeoffs, impact.\n"
                    "- Experience summary: 3–5 bullets, recent first, company + outcome.\n\n"
                    "Hard rules:\n"
                    "- Use ONLY PROFILE, CONTACT, and RETRIEVED CONTEXT. Do not invent libraries or roles.\n"
                    "- Never say 'based on the context' or 'the context doesn't include…'. "
                    "If a detail is missing, answer with closest verified facts and invite a follow-up.\n"
                    "- Balance product/UI craft with collaboration and end-to-end delivery — avoid sounding one-note.\n"
                    "- No markdown headings unless asked. Light **bold** ok."
                ),
            ),
            (
                "human",
                "Context:\n{context}\n\nQuestion: {question}\n\nWrite the best direct answer:",
            ),
        ]
    )

    def retrieve_context(question: str) -> str:
        docs = retriever.invoke(_expand_query(question))
        return _format_docs(docs)

    chain = (
        {
            "context": retrieve_context,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    print("✅ RAG chain created successfully!")
    return chain


def init_rag(force_rebuild: bool = False):
    global rag_chain
    print("🚀 Initializing RAG pipeline...")
    vectorstore = _load_or_build_vectorstore(force=force_rebuild)
    rag_chain = _build_rag_chain(vectorstore)
    print("🎉 Backend RAG ready.")


@app.on_event("startup")
async def startup_event():
    init_rag(force_rebuild=False)


class Query(BaseModel):
    question: str


def _clean_answer(text: str) -> str:
    patterns = [
        r"^\s*(based on (the )?(provided )?context[:,]?\s*)",
        r"^\s*(from (the )?context[:,]?\s*)",
        r"^\s*(according to (the )?(provided )?context[:,]?\s*)",
        r"^\s*(here( is|’s|'s)? (a )?(summary|overview)[:,]?\s*)",
        r"^\s*(in summary[:,]?\s*)",
        r"^\s*(overall[:,]?\s*)",
        r"^\s*(to (summarize|sum up)[:,]?\s*)",
        r"^\s*(i don'?t know\.?\s*)",
        r"the context (doesn'?t|does not) include[^.]*\.?\s*",
        r"i don'?t have (that|enough) (info|information|context)[^.]*\.?\s*",
    ]
    cleaned = text or ""
    for p in patterns:
        cleaned = re.sub(p, "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


@app.post("/ask")
def ask_question(query: Query):
    if not rag_chain:
        return {"answer": "Sorry, the AI pipeline is not ready yet. Please try again in a moment."}

    try:
        answer = rag_chain.invoke(query.question)
        return {"answer": _clean_answer(answer)}
    except Exception as e:
        print(f"An error occurred during query processing: {e}")
        err = str(e).lower()
        if "api_key" in err or "authentication" in err or "unauthorized" in err:
            return {
                "answer": (
                    "Anthropic API key is missing or invalid. "
                    "Set ANTHROPIC_API_KEY in backend/.env or as a Hugging Face Space secret."
                )
            }
        if "not_found" in err or "model:" in err:
            return {
                "answer": (
                    "The configured Anthropic model is unavailable. "
                    "Update ANTHROPIC_MODEL (e.g. claude-haiku-4-5)."
                )
            }
        return {"answer": "Sorry, I encountered an error while processing your request."}


@app.post("/rebuild")
def rebuild_index():
    """Force reindex from backend/data (use after replacing the resume PDF)."""
    try:
        init_rag(force_rebuild=True)
        return {"status": "ok", "message": "Vector store rebuilt from backend/data."}
    except Exception as e:
        print(f"Rebuild failed: {e}")
        return {"status": "error", "message": str(e)}


@app.get("/health")
def health():
    return {
        "status": "ok" if rag_chain else "starting",
        "data_dir": str(DATA_DIR),
        "data_hash": _data_content_hash()[:12],
    }
