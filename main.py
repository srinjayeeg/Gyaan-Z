# main.py
from fastapi import FastAPI, UploadFile, File, Query
import shutil
from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store, retrieve_chunks, get_all_chunks_by_course

app = FastAPI()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), course_id: str = Query(...)):
    """Upload a PDF file and process it for a specific course."""
    file_path = f"data/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_text_from_pdf(file_path)
    chunks = chunk_text(pages, file.filename, course_id)
    save_chunks_to_json(chunks, course_id)

    db = create_vector_store(chunks, course_id)

    return {
        "message": "File processed successfully",
        "course_id": course_id,
        "chunks_created": len(chunks),
        "document_name": file.filename
    }


@app.get("/retrieve/")
async def retrieve(query: str = Query(...), course_id: str = Query(...)):
    """Retrieve relevant chunks for a query from a specific course."""
    results = retrieve_chunks(query, course_id)
    return {
        "query": query,
        "course_id": course_id,
        "results": results,
        "count": len(results)
    }


@app.get("/course/{course_id}/chunks")
async def get_course_chunks(course_id: str):
    """Get all chunks for a specific course."""
    chunks = get_all_chunks_by_course(course_id)
    return {
        "course_id": course_id,
        "total_chunks": len(chunks),
        "chunks": chunks
    }