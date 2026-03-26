# pipeline.py
from PyPDF2 import PdfReader

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

def chunk_text(pages_data, document_name, chunk_size=500, chunk_overlap=100):
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
                "page_number": page["page_number"]
            })
            if end == text_length:
                break
            start += chunk_size - chunk_overlap

    return all_chunks

import json

def save_chunks_to_json(chunks, file_name="chunks.json"):
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=4, ensure_ascii=False)