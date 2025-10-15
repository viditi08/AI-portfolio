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
    This function runs once when the server starts.
    It builds the entire RAG pipeline and stores it in a global variable.
    """
    global rag_chain
    print("🚀 Server starting up...")
    
    # 1. Load Documents
    # We use a DirectoryLoader to load all files from the 'data' folder.
    print("   1. Loading documents from './data'...")
    pdf_loader = DirectoryLoader("./data", glob="**/*.pdf", loader_cls=PyPDFLoader)
    # Use TextLoader for .txt files to avoid unstructured dependency
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

    # 3. Create Embeddings and Vector Store
    # We use a free, powerful embedding model from Hugging Face.
    # This runs locally and does not require an API key.
    print("   3. Initializing embedding model...")
    embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("   4. Creating vector store (ChromaDB)... This may take a moment.")
    vectorstore = Chroma.from_documents(documents=splits, embedding=embedding_model)
    print("   ✅ Vector store created.")

    # 5. Initialize the LLM (Claude)
    print("   5. Initializing LLM (Claude)...")
    llm = ChatAnthropic(model="claude-sonnet-4-5", temperature=0.7)
    print("   ✅ LLM initialized.")
    
    # 6. Create the RAG Chain
    print("   6. Creating RAG chain...")
    rag_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True # Optional: to see which docs were used
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
        
        # You can also inspect the source documents used
        # for doc in result['source_documents']:
        #     print(f"  > Source: {doc.metadata.get('source', 'Unknown')}")

        return {"answer": result['result']}
        
    except Exception as e:
        print(f"An error occurred during query processing: {e}")
        return {"answer": "Sorry, I encountered an error while processing your request."}