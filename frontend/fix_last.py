import os
file1 = r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\components\command-center\governance\Row6_Governance.jsx"

with open(file1, "r", encoding="utf-8") as f:
    text = f.read()
text = text.replace("../../../../hooks", "../../../hooks")
with open(file1, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
