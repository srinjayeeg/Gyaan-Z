from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store


def run_pipeline(file_path, document_name):
    # Step 1: Extract
    pages = extract_text_from_pdf(file_path)

    # Step 2: Chunk
    chunks = chunk_text(pages, document_name)

    # Step 3: Save JSON (optional)
    save_chunks_to_json(chunks)

    # Step 4: Vector DB
    db = create_vector_store(chunks)

    return db  # 🔥 VERY IMPORTANT