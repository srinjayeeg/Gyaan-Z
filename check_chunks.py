#!/usr/bin/env python3
from vector_store import get_all_chunks_by_course

chunks = get_all_chunks_by_course('python1')
print(f'Total chunks: {len(chunks)}')

# Check for various keywords
keywords = ['python', 'programming', 'code', 'function', 'class', 'variable', 'demo']
for keyword in keywords:
    count = sum(1 for c in chunks if keyword.lower() in c.get('content', '').lower())
    print(f'Chunks containing "{keyword}": {count}')

# Show a sample chunk
if chunks:
    print(f'\nSample chunk content:')
    print(chunks[0].get('content', '')[:500])