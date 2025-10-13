import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

os.environ["TOKENIZERS_PARALLELISM"] = "false"
load_dotenv()

from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_anthropic import ChatAnthropic
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

app = FastAPI()
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

retriever = None
llm = None

@app.on_event("startup")
async def load_model_and_data():
    global retriever, llm
    loader = TextLoader("portfolio_stories.txt") #
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    db = Chroma.from_documents(texts, embeddings)
    retriever = db.as_retriever(search_kwargs={"k": 3})
    llm = ChatAnthropic(model="claude-3-sonnet-20240229") # Using a more recent model
    print("✅ Backend startup complete with local embeddings and Claude.")

class Query(BaseModel):
    question: str

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.post("/ask")
def ask_question(query: Query):
    if not retriever or not llm:
        return {"error": "Backend not initialized yet. Please wait a moment."}
    
    question = query.question.strip().lower()

    # --- NEW: Intercept the "hire" prompt ---
    if "looking to hire" in question or "looking for a talent" in question:
        print("✅ Returning Hire Me card response.")
        
        # This special string tells the frontend to render a card and suggestion chips.
        hire_me_response = """
### **</> Tech Stack**
| Languages | Backend | Frontend | DevOps & Cloud |
|---|---|---|---|
| Python | FastAPI | React.js | AWS (EC2, S3, Lambda) |
| Java | Node.js | Tailwind CSS | Docker |
| JavaScript | Django REST | HTML5/CSS3 | Kubernetes |
| TypeScript| Spring Boot | | Terraform |

### **🚀 What I Bring**
- Shipped production AI features and full-stack applications.
- Experience building scalable cloud-native data pipelines with Spark and Kubernetes.
- Automated 60% of customer support queries using fine-tuned language models.
- Reduced application processing time by 45% by building a B2B platform from the ground up.
- Strong product-first thinking and a user-centered design approach.
[SUGGESTIONS:How can I contact you?,Tell me about a challenging project,What's your experience with AI?]
"""
        return {"answer": hire_me_response}

    # --- Original RAG logic for all other questions ---
    retrieved_docs = retriever.invoke(question)
    if retrieved_docs:
        print("✅ Context found. Answering with RAG.")
        rag_prompt_template = "Context: {context}\nQuestion: {question}\nAnswer:"
        rag_prompt = PromptTemplate.from_template(rag_prompt_template)
        rag_chain = ({"context": retriever | format_docs, "question": RunnablePassthrough()} | rag_prompt | llm | StrOutputParser())
        answer = rag_chain.invoke(question)
    else:
        print("⚠️ No context found. Answering with general knowledge.")
        fallback_chain = llm | StrOutputParser()
        answer = fallback_chain.invoke(question)
        
    return {"answer": answer}