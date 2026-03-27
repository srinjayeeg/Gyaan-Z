#!/usr/bin/env python3
from vector_store import retrieve_chunks

chunks = retrieve_chunks('python programming', 'python1')
print(f'Chunks found for "python programming": {len(chunks)}')

if chunks:
    print('First chunk content preview:')
    print(chunks[0].get('content', '')[:200])
else:
    print('No chunks found. Checking why...')
    from vector_store import get_all_chunks_by_course
    all_chunks = get_all_chunks_by_course('python1')
    print(f'Total chunks in course: {len(all_chunks)}')

    # Check if any chunk contains the query
    query = 'python programming'
    matches = [c for c in all_chunks if query.lower() in c.get('content', '').lower()]
    print(f'Chunks containing "{query}": {len(matches)}')

    if matches:
        print('Sample match:')
        print(matches[0].get('content', '')[:200])