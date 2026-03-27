from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store

def run_pipeline():
    # Get input from user
    file_path = input("Enter PDF path: ").strip()
    if not file_path:
        print("No path entered, exiting.")
        return
    
    course_id = input("Enter Course ID: ").strip()
    if not course_id:
        print("No course ID entered, exiting.")
        return

    # Step 1: Extract
    print(f"📄 Extracting text from {file_path}...")
    pages = extract_text_from_pdf(file_path)
    print(f"✅ Extracted {len(pages)} pages")

    # Step 2: Chunk
    print(f"\n✂️  Chunking text for course: {course_id}...")
    chunks = chunk_text(pages, file_path, course_id)
    print(f"✅ Created {len(chunks)} chunks")

    # Step 3: Save JSON
    print("\n💾 Saving chunks to JSON...")
    save_chunks_to_json(chunks, course_id)
    print(f"✅ Chunks saved to chunks_{course_id}.json")

    # Step 4: Vector DB
    print("\n🗄️  Creating vector store...")
    db = create_vector_store(chunks, course_id)
    print(f"✅ Vector store updated for course: {course_id}")

    print("\n✨ Pipeline completed successfully!")
    print(f"Course ID: {course_id}")
    print(f"Total chunks: {len(chunks)}")

if __name__ == "__main__":
    run_pipeline()