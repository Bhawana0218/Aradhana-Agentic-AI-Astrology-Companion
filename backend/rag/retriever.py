import logging
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)

INDEX_DIR = Path(__file__).parent / "faiss_index"

_retriever = None


def load_retriever():
    global _retriever
    if _retriever is not None:
        return _retriever

    index_path = str(INDEX_DIR)
    if not INDEX_DIR.exists() or not any(INDEX_DIR.iterdir()):
        logger.warning(f"FAISS index not found at {index_path}. Run build_index.py first.")
        return None

    try:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        _retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        logger.info("Retriever loaded successfully")
        return _retriever
    except Exception as e:
        logger.exception(f"Failed to load retriever: {e}")
        return None
