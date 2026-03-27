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


def retrieve_chunks(query, course_id, db=None, num_chunks=5):
    """Retrieve chunks for a specific course based on query using keyword matching."""
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

    # Extract keywords from query (simple approach)
    query_lower = query.lower()
    query_words = set(query_lower.split())

    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'what', 'how', 'why', 'when', 'where', 'who', 'which', 'tell', 'me', 'about', 'please', 'can', 'you', 'i', 'we', 'they', 'it', 'this', 'that', 'these', 'those'}
    query_keywords = query_words - stop_words

    if not query_keywords:
        # If no keywords left after stop word removal, use original words
        query_keywords = query_words

    # Score chunks based on keyword matches
    scored_chunks = []
    for chunk in course_chunks:
        content = chunk.get("content", "").lower()
        content_words = set(content.split())

        # Calculate match score
        keyword_matches = len(query_keywords & content_words)
        total_keywords = len(query_keywords)

        if total_keywords > 0:
            match_score = keyword_matches / total_keywords
        else:
            match_score = 0

        # Also check for partial substring matches
        substring_score = 0
        for keyword in query_keywords:
            if keyword in content:
                substring_score += 1

        substring_score = substring_score / len(query_keywords) if query_keywords else 0

        # Combine scores
        final_score = (match_score * 0.7) + (substring_score * 0.3)

        if final_score > 0:  # Only include chunks with some relevance
            scored_chunks.append((chunk, final_score))

    # Sort by score and return top chunks
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    results = [chunk for chunk, score in scored_chunks[:num_chunks]]

    # Debug output
    for i, res in enumerate(results[:3]):
        print(f"Result {i+1} (score: {scored_chunks[i][1]:.3f}):")
        print("Content:", res.get("content", "")[0:150])
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
