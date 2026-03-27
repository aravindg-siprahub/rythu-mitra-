# 🚀 RENDER.COM ENTERPRISE DEPLOYMENT GUIDE

This guide migrates Rythu Mitra from EC2 to Render.com using "Blueprints" (Infrastructure as Code). This ensures Database, Redis, Backend, and Frontend are deployed correctly and connected automatically.

## 1️⃣ PREPARE GITHUB
1.  **Push Latest Changes**:
    Ensure the latest `render.yaml`, `backend/build.sh`, and `backend/requirements.txt` are pushed to your GitHub repository (`rythu-mitra-enterprise`).
    ```bash
    git add .
    git commit -m "Render Migration Configuration"
    git push origin main
    ```

## 2️⃣ DEPLOY ON RENDER
1.  **Login**: Go to [dashboard.render.com](https://dashboard.render.com).
2.  **Create Blueprint**:
    *   Click **New +** -> **Blueprint**.
    *   Connect your GitHub account.
    *   Select the `rythu-mitra-enterprise` repository.
3.  **Configure**:
    *   Render will detect `render.yaml`.
    *   Name the blueprint (e.g., `rythu-mitra-prod`).
    *   Click **Apply**.

## 3️⃣ WHAT WILL HAPPEN (AUTOMATICALLY)
Render will now provision:
1.  **Postgres Database** (`rythu_mitra_db`).
2.  **Redis Cache** (`rythu-mitra-redis`).
3.  **Backend Web Service** (`rythu-mitra-backend`):
    *   It will run `build.sh`.
    *   It will migrate the database.
    *   It will start Gunicorn.
4.  **Frontend Static Site** (`rythu-mitra-frontend`):
    *   It will build React.
    *   It will **automatically inject** the Backend URL via `REACT_APP_API_URL`.

## 4️⃣ VERIFICATION
Once the Dashboard shows "Deploy Succeeded" (green):

1.  **Click the Frontend URL** (e.g., `https://rythu-mitra-frontend.onrender.com`).
2.  **Check API Connection**:
    *   Open Chrome DevTools -> Network.
    *   Refresh the page.
    *   Ensure calls to `/api/v1/ai/predict/` are going to `https://rythu-mitra-backend.onrender.com`.

## 5️⃣ TROUBLESHOOTING
*   **Build Fail (Backend)**: Check `backend/requirements.txt` issues.
*   **Database Error**: Ensure `DATABASE_URL` is being read correctly in `settings.py`.
*   **CORS Error**: Ensure `.onrender.com` is in `ALLOWED_HOSTS` (I have already added this).

**You are ready to click "New Blueprint" on Render.**
