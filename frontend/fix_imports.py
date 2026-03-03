import os

src_dir = r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src"

def fix_imports():
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace("from '../../../", "from '../../")
                new_content = new_content.replace("import '../../../", "import '../../")
                new_content = new_content.replace("from '../hooks/", "from './hooks/")
                new_content = new_content.replace("from '../components/", "from './components/")
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {filepath}")

fix_imports()
