#!/usr/bin/env python3
from vector_store import get_all_chunks_by_course

chunks = get_all_chunks_by_course('python1')

# Check if any chunks contain the full query
query = 'What is Python programming?'
query_lower = query.lower()

matching_chunks = []
for i, chunk in enumerate(chunks):
    content = chunk.get('content', '').lower()
    if query_lower in content:
        matching_chunks.append((i, chunk))

print(f'Query: "{query}"')
print(f'Chunks containing exact query: {len(matching_chunks)}')

# Check for partial matches
python_chunks = [c for c in chunks if 'python' in c.get('content', '').lower()]
programming_chunks = [c for c in chunks if 'programming' in c.get('content', '').lower()]

print(f'Chunks containing "python": {len(python_chunks)}')
print(f'Chunks containing "programming": {len(programming_chunks)}')

# Show what the retrieval function actually does
print(f'\nTesting retrieval function...')
from vector_store import retrieve_chunks
retrieved = retrieve_chunks(query, 'python1')
print(f'Retrieved chunks: {len(retrieved)}')