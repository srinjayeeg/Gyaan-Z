# pipeline.py
from PyPDF2 import PdfReader
import os

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    pages_data = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        pages_data.append({
            "page_number": i + 1,
            "text": text
        })

    return pages_data

def chunk_text(pages_data, document_name, course_id, chunk_size=500, chunk_overlap=100):
    """Split page text into overlapping chunks without langchain dependency."""
    all_chunks = []

    for page in pages_data:
        text = page.get("text") or ""
        if not text.strip():
            continue

        start = 0
        text_length = len(text)
        while start < text_length:
            end = min(start + chunk_size, text_length)
            chunk = text[start:end]
            all_chunks.append({
                "content": chunk,
                "document_name": document_name,
                "course_id": course_id,
                "page_number": page["page_number"]
            })
            if end == text_length:
                break
            start += chunk_size - chunk_overlap

    return all_chunks

import json

def save_chunks_to_json(chunks, course_id, file_name="chunks.json"):
    """Save chunks to a course-specific JSON file."""
    # Create course-specific filename
    course_file_name = f"chunks_{course_id}.json"
    with open(course_file_name, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=4, ensure_ascii=False)
    
    # Also maintain a master chunks file for reference
    existing_chunks = []
    if os.path.exists(file_name):
        with open(file_name, "r", encoding="utf-8") as f:
            existing_chunks = json.load(f)
    
    # Add new chunks to master file
    existing_chunks.extend(chunks)
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(existing_chunks, f, indent=4, ensure_ascii=False)












# pipeline.py

# from PyPDF2 import PdfReader
# import os
# import json

# def extract_text_from_pdf(file_path):
#     reader = PdfReader(file_path)
#     pages_data = []

#     for i, page in enumerate(reader.pages):
#         text = page.extract_text()
#         pages_data.append({
#             "page_number": i + 1,
#             "text": text
#         })

#     return pages_data

# def analyze_document(pages_data):
#     total_length = 0
#     valid_pages = 0

#     for page in pages_data:
#         text = page.get("text") or ""
#         if text.strip():
#             total_length += len(text)
#             valid_pages += 1

#     avg_chars_per_page = total_length / valid_pages if valid_pages else 0

#     return {
#         "total_length": total_length,
#         "avg_chars_per_page": avg_chars_per_page,
#         "total_pages": valid_pages
#     }

# def get_dynamic_chunk_params(stats):
#     avg = stats["avg_chars_per_page"]

#     if avg < 800:
#         chunk_size = 300
#     elif avg < 2000:
#         chunk_size = 600
#     else:
#         chunk_size = 1000

#     chunk_overlap = int(chunk_size * 0.2)

#     return chunk_size, chunk_overlap

# def clean_text(text):
#     return text.replace("\n", " ").strip()


# def is_valid_chunk(chunk):
#     words = chunk.split()

#     # Remove very small chunks
#     if len(words) < 30:
#         return False

#     # Remove noisy chunks (too many symbols)
#     alpha_ratio = sum(c.isalpha() for c in chunk) / max(len(chunk), 1)
#     if alpha_ratio < 0.5:
#         return False

#     return True

# def chunk_text(pages_data, document_name, course_id):
#     # 🔍 Step 1: Analyze document
#     stats = analyze_document(pages_data)

#     # 🎯 Step 2: Get dynamic parameters
#     chunk_size, chunk_overlap = get_dynamic_chunk_params(stats)

#     print(f"📊 Chunking Strategy → size={chunk_size}, overlap={chunk_overlap}")
#     print(f"📄 Pages: {stats['total_pages']} | Avg chars/page: {int(stats['avg_chars_per_page'])}")

#     all_chunks = []

#     for page in pages_data:
#         text = clean_text(page.get("text") or "")
#         if not text:
#             continue

#         start = 0
#         text_length = len(text)

#         while start < text_length:
#             end = min(start + chunk_size, text_length)
#             chunk = text[start:end]

#             # 🚫 Step 3: Noise filtering
#             if is_valid_chunk(chunk):
#                 all_chunks.append({
#                     "content": chunk,
#                     "document_name": document_name,
#                     "course_id": course_id,
#                     "page_number": page["page_number"]
#                 })

#             if end == text_length:
#                 break

#             start += chunk_size - chunk_overlap

#     print(f"✅ Total chunks created: {len(all_chunks)}")

#     return all_chunks


# def save_chunks_to_json(chunks, course_id, file_name="chunks.json"):
#     # Course-specific file
#     course_file_name = f"chunks_{course_id}.json"

#     with open(course_file_name, "w", encoding="utf-8") as f:
#         json.dump(chunks, f, indent=4, ensure_ascii=False)

#     # Master file
#     existing_chunks = []

#     if os.path.exists(file_name):
#         with open(file_name, "r", encoding="utf-8") as f:
#             existing_chunks = json.load(f)

#     existing_chunks.extend(chunks)

#     with open(file_name, "w", encoding="utf-8") as f:
#         json.dump(existing_chunks, f, indent=4, ensure_ascii=False)

#     print(f"💾 Saved {len(chunks)} chunks for course {course_id}")