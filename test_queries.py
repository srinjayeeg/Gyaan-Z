#!/usr/bin/env python3
from vector_store import retrieve_chunks

# Test different queries
test_queries = [
    'python programming',
    'python',
    'programming',
    'tell me about python',
    'what is python',
    'python language'
]

print("Testing different queries with py123:")
for query in test_queries:
    chunks = retrieve_chunks(query, 'py123')
    print(f'Query: "{query}" -> {len(chunks)} chunks found')