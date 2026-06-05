import logging
from pathlib import Path

from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DOCS_DIR = Path(__file__).parent / "docs"
INDEX_DIR = Path(__file__).parent / "faiss_index"


def build_index():
    if not DOCS_DIR.exists():
        logger.error(f"Docs directory not found: {DOCS_DIR}")
        return

    documents = []
    for file_path in sorted(DOCS_DIR.glob("*.txt")):
        content = file_path.read_text(encoding="utf-8").strip()
        if content:
            documents.append({"content": content, "source": file_path.name})
            logger.info(f"Loaded {file_path.name} ({len(content)} chars)")

    if not documents:
        logger.warning("No documents found to index.")
        return

    texts = [d["content"] for d in documents]
    metadatas = [{"source": d["source"]} for d in documents]

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.create_documents(texts, metadatas=metadatas)

    logger.info(f"Split into {len(chunks)} chunks")

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(chunks, embeddings)

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(INDEX_DIR))

    logger.info(f"Index built: {len(chunks)} chunks saved to {INDEX_DIR}")


if __name__ == "__main__":
    build_index()
