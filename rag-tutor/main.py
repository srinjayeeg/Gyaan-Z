# main.py
from fastapi import FastAPI, UploadFile, File
import shutil
from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store

app = FastAPI()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"data/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_text_from_pdf(file_path)
    chunks = chunk_text(pages, file.filename)
    save_chunks_to_json(chunks)

    db = create_vector_store(chunks)

    return {"message": "File processed successfully"}