from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store

def run_pipeline():
    file_path = "data/ASMR Bytes.pdf"

    # Step 1: Extract
    pages = extract_text_from_pdf(file_path)

    # Step 2: Chunk
    chunks = chunk_text(pages, "ASMR Bytes.pdf")

    # Step 3: Save JSON
    save_chunks_to_json(chunks)

    # Step 4: Vector DB
    db = create_vector_store(chunks)

    print("✅ Pipeline completed successfully!")

if __name__ == "__main__":
    run_pipeline()