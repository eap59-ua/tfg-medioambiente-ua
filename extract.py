import zipfile
import xml.etree.ElementTree as ET
import os

docx_file = r'..\PROMPT_nuevo_chat_tfg.docx'
out_file = r'prompt_texto.txt'

try:
    with zipfile.ZipFile(docx_file, 'r') as docx:
        content = docx.read('word/document.xml')
        
    tree = ET.fromstring(content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text_elements = tree.findall('.//w:t', ns)
    text = '\n'.join([t.text for t in text_elements if t.text])
    
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
