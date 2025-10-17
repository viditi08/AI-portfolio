import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Imports
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# --- FastAPI App Setup ---
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

# --- Global variable for the RAG chain ---
rag_chain = None

@app.on_event("startup")
async def startup_event():
    """
    Build the RAG pipeline once on startup and cache in a global.
    """
    global rag_chain
    print("🚀 Server starting up...")

    persist_dir = "./chroma_db"

    # 1. Initialize fast embedding model
    print("   1. Initializing embedding model (all-MiniLM-L6-v2 for speed)...")
    embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_model = HuggingFaceEmbeddings(model_name=embedding_model_name)

    # Determine embedding dimension and create a model-specific collection name to avoid dim mismatches
    try:
        test_dim = len(embedding_model.embed_query("dimension probe"))
    except Exception:
        test_dim = 0  # fallback, though this should not happen
    safe_model_tag = re.sub(r"[^a-zA-Z0-9_-]+", "-", embedding_model_name.split("/")[-1])
    collection_name = f"portfolio_{safe_model_tag}_{test_dim or 'dim'}"

    # 2. Load or build Vector Store (ChromaDB)
    print("   2. Loading/creating vector store (ChromaDB)...")
    vectorstore = None
    if os.path.isdir(persist_dir) and os.listdir(persist_dir):
        try:
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=embedding_model,
                persist_directory=persist_dir,
            )
            # If the collection exists but is empty, we'll rebuild below
            print("   ✅ Loaded Chroma store (collection:", collection_name, ")")
        except Exception as e:
            print(f"   ⚠️ Failed to load existing vector store, will rebuild: {e}")

    needs_rebuild = vectorstore is None
    if not needs_rebuild:
        try:
            count = vectorstore._collection.count()  # type: ignore[attr-defined]
            if not count:
                needs_rebuild = True
                print("   ℹ️ Collection is empty; will (re)build from ./data ...")
            else:
                print(f"   ✅ Collection has {count} vectors.")
        except Exception as e:
            print(f"   ⚠️ Could not determine collection size, will (re)build: {e}")
            needs_rebuild = True

    if needs_rebuild:
        print("   → Building vector store from ./data ...")
        # Load Documents only if we need to (first run or rebuild)
        pdf_loader = DirectoryLoader("./data", glob="**/*.pdf", loader_cls=PyPDFLoader)
        txt_loader = DirectoryLoader("./data", glob="**/*.txt", loader_cls=TextLoader)
        pdf_docs = pdf_loader.load()
        txt_docs = txt_loader.load()
        all_docs = pdf_docs + txt_docs
        print(f"   ✅ Loaded {len(all_docs)} documents.")

        # Split Documents into Chunks (smaller for faster context stuffing)
        print("   → Splitting documents into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        splits = text_splitter.split_documents(all_docs)
        print(f"   ✅ Created {len(splits)} document chunks.")

        # Create & persist vector store
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embedding_model,
            collection_name=collection_name,
            persist_directory=persist_dir,
        )
        vectorstore.persist()
        print("   ✅ Vector store ready.")

    # 3. Configure retriever (lower k for speed)
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3},
    )

    # 4. Initialize the LLM (Claude - fast default)
    print("   3. Initializing LLM (Claude 3 Haiku by default)...")
    model_name = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")
    # Map common aliases to concrete versioned model names to avoid 404s
    model_aliases = {
        "claude-3-haiku-latest": "claude-3-haiku-20240307",
        "haiku-latest": "claude-3-haiku-20240307",
        "claude-3-sonnet-latest": "claude-3-sonnet-20240229",
        "sonnet-latest": "claude-3-sonnet-20240229",
        "claude-3-opus-latest": "claude-3-opus-20240229",
        "opus-latest": "claude-3-opus-20240229",
        "claude-3-5-sonnet-latest": "claude-3-5-sonnet-20240620",
        "sonnet-3.5-latest": "claude-3-5-sonnet-20240620",
    }
    model_name = model_aliases.get(model_name, model_name)
    llm = ChatAnthropic(model=model_name, temperature=0.1, max_tokens=300)
    print(f"   ✅ LLM initialized: {model_name}")
    
    # 5. Create a strict, punchy prompt for QA
    system_instructions = (
        "You are Viditi's AI portfolio assistant. Use only the provided context. "
        "Be crisp, confident, and direct—no prefaces or hedging. "
        "Answer in 1–3 sentences unless a list is needed. If the answer isn't in the context, say you don't know. "
        "Prefer short bullet points for lists. Include links if present in the context."
    )
    prompt = PromptTemplate(
        template=(
            "System: {system}\n\n"
            "You will be given context and a question. Answer strictly from the context.\n\n"
            "Context:\n{context}\n\n"
            "Question: {question}\n\n"
            "Answer:"
        ),
        input_variables=["system", "context", "question"],
        partial_variables={"system": system_instructions},
    )

    # 6. Create the RAG Chain with custom prompt (no sources for less overhead)
    print("   4. Creating RAG chain...")
    rag_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=False,
        chain_type_kwargs={"prompt": prompt},
    )
    print("✅ RAG chain created successfully!")
    print("🎉 Backend startup complete. Ready to receive requests.")


class Query(BaseModel):
    question: str

# --- Helpers ---
def _clean_answer(text: str) -> str:
    patterns = [
        r"^\s*(based on (the )?(provided )?context[:,]?\s*)",
        r"^\s*(from (the )?context[:,]?\s*)",
        r"^\s*(according to (the )?(provided )?context[:,]?\s*)",
        r"^\s*(here( is|’s|'s)? (a )?(summary|overview)[:,]?\s*)",
        r"^\s*(in summary[:,]?\s*)",
        r"^\s*(overall[:,]?\s*)",
        r"^\s*(to (summarize|sum up)[:,]?\s*)",
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
        # Run the user's question through the RAG chain
        result = rag_chain.invoke({"query": query.question})
        # RetrievalQA returns a dict with key 'result' when return_source_documents=False
        answer = result.get('result', '') if isinstance(result, dict) else str(result)
        answer = _clean_answer(answer)
        return {"answer": answer}
        
    except Exception as e:
        print(f"An error occurred during query processing: {e}")
        return {"answer": "Sorry, I encountered an error while processing your request."}