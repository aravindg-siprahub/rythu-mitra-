# LIVE DEPLOYMENT CHECKLIST

## 🖥️ Local Machine
1.  [ ] **Git Config**: Initialize and Add Remote.
2.  [ ] **Files**: Verify all `VALIDATED_*` files are in place.

## ☁️ GitHub
1.  [ ] **Repo**: Created `rythu-mitra-enterprise`.
2.  [ ] **Secrets**: Added all 6 secrets successfully.

## 🖥️ EC2 Server (16.170.172.200)
1.  [ ] **SSH**: `ssh -i rythu_1.pem ubuntu@16.170.172.200`
2.  [ ] **Setup**:
    *   Create script: `nano setup_ec2.sh` (paste content)
    *   Execute: `chmod +x setup_ec2.sh && ./setup_ec2.sh`
    *   **Logout/Login**: `exit` then SSH again.

## 🚀 Activation
1.  [ ] **Deploy**: Run `git push -u origin main` locally.
2.  [ ] **Monitor**: Check GitHub Actions tab for Green success.

## ✅ Verification
1.  [ ] **Visit**: `http://16.170.172.200` (Frontend loads?)
2.  [ ] **API**: `curl http://16.170.172.200/health/` -> `{"status": "healthy"}`
3.  [ ] **Logs**: `docker compose logs -f` (No errors?)
