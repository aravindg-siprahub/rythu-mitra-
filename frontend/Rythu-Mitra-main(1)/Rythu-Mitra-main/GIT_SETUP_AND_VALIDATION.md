# GIT & GITHUB SETUP GUIDE
**Target IP:** 16.170.172.200

## 1. Local Initialization
Run in `rythu-mitra/`:
```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rythu-mitra-enterprise.git
git add .
git commit -m "Production Release v1"
```

## 2. GitHub Secrets
Add to **Settings > Secrets > Actions**:

| Secret | Value |
|:---|:---|
| EC2_HOST | `16.170.172.200` |
| EC2_USER | `ubuntu` |
| EC2_SSH_KEY | *(Content of rythu_1.pem)* |
| DOCKERHUB_USERNAME | *(Your ID)* |
| DOCKERHUB_PASSWORD | *(Your Token)* |
| BACKEND_ENV | *(Content of backend/.env)* |

## 3. Launch
```bash
git push -u origin main
```
