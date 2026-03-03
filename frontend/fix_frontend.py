import os

files_to_fix = [
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\components\command-center\governance\Row6_Governance.jsx",
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\components\command-center\operations\Row4_Operations.jsx",
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\components\command-center\alerts\Row5_Alerts.jsx",
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\components\command-center\ai-monitoring\Row3_AIMonitoring.jsx"
]

for f in files_to_fix:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace("../../hooks/useTelemetry", "../../../hooks/useTelemetry")
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)

hooks_to_fix = [
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\modules\crop\hooks\useCropPrediction.js",
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\modules\disease\hooks\useDiseaseDetection.js",
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\modules\market\hooks\useMarketData.js",
    r"c:\Users\Aravind\Desktop\rythu-mitra\frontend\src\modules\weather\hooks\useWeather.js"
]

for f in hooks_to_fix:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace("../../services/apiService", "../../../services/apiService")
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)

print("Fixed the 8 files!")
