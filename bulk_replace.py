import os
import re

directories_to_scan = [
    os.path.join('frontend', 'src')
]

replacements = {
    r'text-\[9px\]': 'text-sm',
    r'text-\[10px\]': 'text-sm',
    r'text-\[11px\]': 'text-sm',
    r'text-\[12px\]': 'text-xs',
    r'text-\[13px\]': 'text-sm',
    r"fontSize:\s*'?10px'?": "fontSize: 14",
    r"fontSize:\s*'?9px'?": "fontSize: 14",
    r"fontSize:\s*10\b": "fontSize: 14",
    r"fontSize:\s*9\b": "fontSize: 14",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root_dir in directories_to_scan:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.jsx', '.js', '.css')):
                process_file(os.path.join(dirpath, filename))
print("Bulk replace completed.")
