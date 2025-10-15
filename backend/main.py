import os
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
    
    # 1. Load Documents
    print("   1. Loading documents from './data'...")
    pdf_loader = DirectoryLoader("./data", glob="**/*.pdf", loader_cls=PyPDFLoader)
    txt_loader = DirectoryLoader("./data", glob="**/*.txt", loader_cls=TextLoader)
    pdf_docs = pdf_loader.load()
    txt_docs = txt_loader.load()
    all_docs = pdf_docs + txt_docs
    print(f"   ✅ Loaded {len(all_docs)} documents.")

    # 2. Split Documents into Chunks
    print("   2. Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    splits = text_splitter.split_documents(all_docs)
    print(f"   ✅ Created {len(splits)} document chunks.")

    # 3. Create Embeddings and Vector Store (Persisted)
    print("   3. Initializing embedding model (all-mpnet-base-v2)...")
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    
    print("   4. Creating/persisting vector store (ChromaDB)...")
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embedding_model,
        collection_name="portfolio",
        persist_directory="./chroma_db",
    )
    vectorstore.persist()
    print("   ✅ Vector store ready.")

    # 4. Configure retriever (MMR for better diversity)
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 6, "fetch_k": 24, "lambda_mult": 0.5},
    )

    # 5. Initialize the LLM (Claude)
    print("   5. Initializing LLM (Claude 3.5 Sonnet)...")
    llm = ChatAnthropic(model="claude-3-5-sonnet-latest", temperature=0.2, max_tokens=600)
    print("   ✅ LLM initialized.")
    
    # 6. Create a strict prompt for QA
    system_instructions = (
        "You are Viditi's AI portfolio assistant. Use only the provided context to answer. "
        "If the answer isn't in the context, say you don't know. Be concise, friendly, and helpful. "
        "Prefer bullet points when listing items. Use links if present in the context."
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

    # 7. Create the RAG Chain with custom prompt
    print("   6. Creating RAG chain...")
    rag_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt},
    )
    print("✅ RAG chain created successfully!")
    print("🎉 Backend startup complete. Ready to receive requests.")


class Query(BaseModel):
    question: str

@app.post("/ask")
def ask_question(query: Query):
    if not rag_chain:
        return {"answer": "Sorry, the AI pipeline is not ready yet. Please try again in a moment."}
    
    try:
        # Run the user's question through the RAG chain
        result = rag_chain.invoke({"query": query.question})
        return {"answer": result['result']}
        
    except Exception as e:
        print(f"An error occurred during query processing: {e}")
        return {"answer": "Sorry, I encountered an error while processing your request."}