# vector_store.py
import json
import os

DB_DIR = "chroma_db"
DB_FILE = os.path.join(DB_DIR, "vector_store.json")


def create_vector_store(chunks):
    """Simple local vector store as JSON, no embeddings required."""
    os.makedirs(DB_DIR, exist_ok=True)
    db = {
        "chunks": chunks
    }
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4, ensure_ascii=False)
    return db


def retrieve_chunks(query, db=None):
    if db is None:
        if not os.path.exists(DB_FILE):
            return []
        with open(DB_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)

    query_lower = query.lower()
    results = []
    for c in db.get("chunks", []):
        content = c.get("content", "")
        if query_lower in content.lower():
            results.append(c)

    for res in results[:5]:
        print("Content:", res.get("content", "")[0:200])
        print("Source:", {"document_name": res.get("document_name"), "page_number": res.get("page_number")})
        print("------")

    return results
