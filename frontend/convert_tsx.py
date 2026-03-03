import os
import re
import shutil

src_dir = r"C:\Users\Aravind\Desktop\rythu-mitra\frontend\src\pages\landingPage\rythu-mitra-ai-main (1)\rythu-mitra-ai-main\src\components\landing"
dest_dir = r"C:\Users\Aravind\Desktop\rythu-mitra\frontend\src\components\landing_new"

os.makedirs(dest_dir, exist_ok=True)

for file in os.listdir(src_dir):
    if file.endswith('.tsx'):
        with open(os.path.join(src_dir, file), 'r', encoding='utf-8') as f:
            content = f.read()

        # Simple replacement for relative imports
        content = content.replace("@/lib/utils", "../lib/utils")
        content = content.replace("import type ", "// import type ")
        content = content.replace("}: {", "} = {")
        
        # Remove empty interface declarations (basic TS strip)
        content = re.sub(r'interface\s+\w+\s*{[^}]*}', '', content, flags=re.MULTILINE|re.DOTALL)
        
        dest_file = file.replace('.tsx', '.jsx')
        with open(os.path.join(dest_dir, dest_file), 'w', encoding='utf-8') as f:
            f.write(content)

print("Conversion complete!")
