# vector_store.py
import json
import os

DB_DIR = "chroma_db"
DB_FILE = os.path.join(DB_DIR, "vector_store.json")


def create_vector_store(chunks, course_id):
    """Simple local vector store as JSON, organized by course_id."""
    os.makedirs(DB_DIR, exist_ok=True)
    
    # Load existing database
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)
    else:
        db = {"courses": {}}
    
    # Initialize course if it doesn't exist
    if course_id not in db.get("courses", {}):
        db["courses"] = db.get("courses", {})
        db["courses"][course_id] = {"chunks": []}
    
    # Add new chunks to the course
    db["courses"][course_id]["chunks"].extend(chunks)
    
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4, ensure_ascii=False)
    
    return db


def retrieve_chunks(query, course_id, db=None):
    """Retrieve chunks for a specific course based on query."""
    if db is None:
        if not os.path.exists(DB_FILE):
            return []
        with open(DB_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)

    # Get chunks for the specific course
    course_chunks = db.get("courses", {}).get(course_id, {}).get("chunks", [])
    
    if not course_chunks:
        print(f"No chunks found for course: {course_id}")
        return []
    
    query_lower = query.lower()
    results = []
    for c in course_chunks:
        content = c.get("content", "")
        if query_lower in content.lower():
            results.append(c)

    for res in results[:5]:
        print("Content:", res.get("content", "")[0:200])
        print("Course ID:", res.get("course_id"))
        print("Source:", {"document_name": res.get("document_name"), "page_number": res.get("page_number")})
        print("------")

    return results


def get_all_chunks_by_course(course_id, db=None):
    """Retrieve all chunks for a specific course."""
    if db is None:
        if not os.path.exists(DB_FILE):
            return []
        with open(DB_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)
    
    return db.get("courses", {}).get(course_id, {}).get("chunks", [])
