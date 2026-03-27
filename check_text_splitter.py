import langchain
import pkgutil
import os
print('langchain', langchain.__file__)
print('modules under langchain:')
for m in pkgutil.iter_modules(langchain.__path__):
    if 'text_splitter' in m.name:
        print('found', m.name)
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    print('imported RecursiveCharacterTextSplitter')
except Exception as e:
    print(type(e).__name__, e)
