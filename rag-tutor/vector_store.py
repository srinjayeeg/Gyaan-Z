# vector_store.py

import json
import os
import math

DB_DIR = "chroma_db"
DB_FILE = os.path.join(DB_DIR, "vector_store.json")


# =========================
# CREATE VECTOR STORE
# =========================
def create_vector_store(chunks):
    """Stores chunks in JSON (lightweight DB)."""
    os.makedirs(DB_DIR, exist_ok=True)

    db = {
        "chunks": chunks
    }

    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4, ensure_ascii=False)

    return db


# =========================
# LOAD DB
# =========================
def load_vector_store():
    if not os.path.exists(DB_FILE):
        return {"chunks": []}

    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# =========================
# SIMPLE SIMILARITY FUNCTION
# =========================
def compute_similarity(query, text):
    """
    Basic similarity using word overlap.
    """
    query_words = set(query.lower().split())
    text_words = set(text.lower().split())

    if not text_words:
        return 0

    common_words = query_words.intersection(text_words)

    # Jaccard similarity
    similarity = len(common_words) / len(query_words.union(text_words))

    return similarity


# =========================
# RETRIEVE TOP CHUNKS
# =========================
def retrieve_chunks(query, db=None, top_k=3):
    if db is None:
        db = load_vector_store()

    results = []

    for chunk in db.get("chunks", []):
        content = chunk.get("content", "")

        score = compute_similarity(query, content)

        if score > 0:  # only relevant chunks
            results.append({
                "content": content,
                "document_name": chunk.get("document_name", "Unknown"),
                "page_number": chunk.get("page_number", "N/A"),
                "score": score
            })

    # 🔥 SORT BY BEST MATCH
    results = sorted(results, key=lambda x: x["score"], reverse=True)

    # 🔥 TAKE TOP K
    top_results = results[:top_k]

    return top_results