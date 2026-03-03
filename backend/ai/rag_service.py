"""
rag_service.py — Rythu Mitra RAG Service
=========================================
AI provider: OpenRouter (OpenAI-compatible API)
  - Uses langchain_openai SDK with custom base_url pointing to OpenRouter
  - Chat model: configurable via OPENROUTER_MODEL env var
  - Embeddings: text-embedding-3-small routed through OpenRouter
  - Vector store: Supabase PGVector

Docs: https://openrouter.ai/docs#openai-compatibility
"""
import os
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

# ── OpenRouter configuration ──────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-flash-1.5")


class RAGService:
    """
    Retrieval-Augmented Generation service for Rythu Mitra.
    Uses OpenRouter as the LLM/embedding provider (OpenAI-compatible API).
    Vector store: Supabase PGVector.
    """

    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.db_url = os.getenv("DATABASE_URL")
        self.embeddings = None
        self.vector_store = None
        self.llm = None

        if not self.api_key:
            logger.warning(
                "[RAGService] OPENROUTER_API_KEY not set. RAG Service disabled."
            )
            return

        try:
            from langchain_openai import OpenAIEmbeddings, ChatOpenAI
            from langchain_community.vectorstores import PGVector

            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",
                openai_api_key=self.api_key,
                openai_api_base=OPENROUTER_BASE_URL,
            )
            self.vector_store = PGVector(
                embedding_function=self.embeddings,
                collection_name="rythu_mitra_knowledge",
                connection_string=self.db_url,
            )
            self.llm = ChatOpenAI(
                model_name=OPENROUTER_MODEL,
                temperature=0.3,
                openai_api_key=self.api_key,
                openai_api_base=OPENROUTER_BASE_URL,
                default_headers={
                    "HTTP-Referer": "https://rythu-mitra.app",
                    "X-Title": "Rythu Mitra Agriculture AI",
                },
            )
            logger.info(f"[RAGService] Initialized. model={OPENROUTER_MODEL}")
        except ImportError as e:
            logger.warning(
                f"[RAGService] LangChain package missing: {e}\n"
                "  Run: pip install langchain langchain-openai langchain-community"
            )

    def add_document(self, text: str, metadata: dict = None) -> bool:
        """Add a document to the Supabase PGVector knowledge base."""
        if not self.api_key:
            logger.error("[RAGService] Cannot add document — OPENROUTER_API_KEY not set.")
            return False
        metadata = metadata or {}
        try:
            self.vector_store.add_texts(texts=[text], metadatas=[metadata])
            return True
        except Exception as e:
            logger.error(f"[RAGService] Error adding document: {e}")
            return False

    def query(self, question: str) -> str:
        """Retrieve context from vector store and generate an answer via OpenRouter."""
        if not self.api_key or not self.llm:
            return "AI Service unavailable — check OPENROUTER_API_KEY and install langchain packages."

        try:
            from langchain.chains import RetrievalQA
            from langchain.prompts import PromptTemplate
        except ImportError:
            return "AI Service unavailable — run: pip install langchain langchain-openai langchain-community"

        prompt_template = """Use the following context to answer the question.
If you don't know the answer, say so honestly — do not fabricate information.

Context: {context}

Question: {question}

Answer:"""

        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": PROMPT},
        )
        try:
            response = qa_chain.invoke({"query": question})
            return response["result"]
        except Exception as e:
            logger.error(f"[RAGService] Query failed: {e}")
            return "I'm having trouble accessing the knowledge base right now."

