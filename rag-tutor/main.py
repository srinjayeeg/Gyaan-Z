from fastapi import FastAPI, UploadFile, File
import shutil
from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store

app = FastAPI()

# 🔥 GLOBAL DB
vector_store = None


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    global vector_store

    file_path = f"data/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_text_from_pdf(file_path)
    chunks = chunk_text(pages, file.filename)
    save_chunks_to_json(chunks)

    # 🔥 SAVE VECTOR STORE
    vector_store = create_vector_store(chunks)

    return {"message": "File processed successfully"}












@app.post("/retrieve/")
async def retrieve(query: str):
    global vector_store

    if vector_store is None:
        return {"error": "No data uploaded yet"}

    docs_with_scores = vector_store.similarity_search_with_score(query, k=3)

    results = []

    for doc, score in docs_with_scores:
        results.append({
            "content": doc.page_content,
            "source": doc.metadata.get("source", "Unknown"),
            "page": doc.metadata.get("page", "N/A"),
            "score": float(score)
        })

    return {"results": results}