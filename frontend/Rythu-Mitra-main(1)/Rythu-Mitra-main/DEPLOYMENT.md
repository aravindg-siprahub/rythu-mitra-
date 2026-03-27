# 🚀 Rythu Mitra - Complete Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [AWS EC2 Production Deployment](#aws-ec2-production-deployment)
3. [Domain & HTTPS Configuration](#domain--https-configuration)
4. [CloudWatch Monitoring Setup](#cloudwatch-monitoring-setup)
5. [S3 Model Storage](#s3-model-storage)
6. [Troubleshooting](#troubleshooting)

---

## 1. Local Development Setup

### Prerequisites
- Docker Desktop installed
- Git installed
- 8GB+ RAM
- 20GB+ free disk space

### Steps

#### 1.1 Clone Repository
```bash
git clone https://github.com/yourusername/rythu-mitra.git
cd rythu-mitra
```

#### 1.2 Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DEBUG=True
USE_SQLITE=True
SECRET_KEY=your-secret-key-for-development
ALLOWED_HOSTS=localhost,127.0.0.1,*
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

#### 1.3 Start Services
```bash
cd ..
docker-compose up -d
```

#### 1.4 Run Migrations
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

#### 1.5 Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/docs/

---

## 2. AWS EC2 Production Deployment

### 2.1 Launch EC2 Instance

#### Instance Configuration
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t3.medium (minimum) or t3.large (recommended)
- **Storage**: 30GB+ GP3 SSD
- **Security Group**:
  - Port 22 (SSH) - Your IP only
  - Port 80 (HTTP) - 0.0.0.0/0
  - Port 443 (HTTPS) - 0.0.0.0/0

#### Elastic IP
1. Allocate Elastic IP
2. Associate with EC2 instance
3. Note the IP address

### 2.2 Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-ELASTIC-IP>
```

### 2.3 Run EC2 Setup Script
```bash
# Download setup script
wget https://raw.githubusercontent.com/yourusername/rythu-mitra/main/deployment/setup_ec2.sh

# Make executable
chmod +x setup_ec2.sh

# Run setup
./setup_ec2.sh

# IMPORTANT: Log out and log back in
exit
ssh -i your-key.pem ubuntu@<EC2-ELASTIC-IP>
```

### 2.4 Clone Repository
```bash
cd /opt
sudo git clone https://github.com/yourusername/rythu-mitra.git
sudo chown -R ubuntu:ubuntu rythu-mitra
cd rythu-mitra
```

### 2.5 Configure Production Environment

**Backend Production .env:**
```bash
nano backend/.env
```

```env
DEBUG=False
USE_SQLITE=False
SECRET_KEY=<generate-strong-secret-key>

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=rythu_mitra
DB_USER=postgres
DB_PASSWORD=<strong-password>
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379

# Security
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,<EC2-IP>
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_STORAGE_BUCKET_NAME=rythu-mitra-models
AWS_S3_REGION_NAME=us-east-1
```

**Frontend Production .env:**
```bash
nano frontend/.env
```

```env
REACT_APP_API_URL=https://your-domain.com/api/v1
REACT_APP_NAME=Rythu Mitra
REACT_APP_VERSION=1.0.0
```

### 2.6 Deploy Application
```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

### 2.7 Verify Deployment
```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test backend
curl http://localhost:8000/health/

# Test frontend
curl http://localhost:3000/
```

---

## 3. Domain & HTTPS Configuration

### 3.1 Domain Setup

#### Option A: Freenom (Free Domain)
1. Visit https://www.freenom.com
2. Search for available domain (.tk, .ml, .ga, .cf, .gq)
3. Register free domain
4. Configure DNS:
   - Type: A
   - Name: @
   - Target: <EC2-ELASTIC-IP>
   - TTL: 3600
   
   - Type: A
   - Name: www
   - Target: <EC2-ELASTIC-IP>
   - TTL: 3600

#### Option B: Cloudflare (Recommended)
1. Purchase domain or transfer existing
2. Add site to Cloudflare
3. Update nameservers
4. Add DNS records:
   - Type: A
   - Name: @
   - Content: <EC2-ELASTIC-IP>
   - Proxy: ON (orange cloud)
   
   - Type: A
   - Name: www
   - Content: <EC2-ELASTIC-IP>
   - Proxy: ON

### 3.2 SSL Certificate Setup
```bash
cd /opt/rythu-mitra
chmod +x deployment/setup_ssl.sh
./deployment/setup_ssl.sh your-domain.com admin@your-domain.com
```

### 3.3 Verify HTTPS
```bash
# Test SSL
curl -I https://your-domain.com

# Check SSL rating
# Visit: https://www.ssllabs.com/ssltest/
```

---

## 4. CloudWatch Monitoring Setup

### 4.1 Create IAM Role for EC2
1. Go to AWS IAM Console
2. Create Role → AWS Service → EC2
3. Attach policies:
   - CloudWatchAgentServerPolicy
   - AmazonS3ReadOnlyAccess (for models)
4. Name: `RythuMitraEC2Role`
5. Attach role to EC2 instance

### 4.2 Install CloudWatch Agent
```bash
# Download agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# Install
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json
```

**CloudWatch Config:**
```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/rythu-mitra/backend/logs/django.log",
            "log_group_name": "/rythu-mitra/backend",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/rythu-mitra/nginx/access",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "RythuMitra",
    "metrics_collected": {
      "cpu": {
        "measurement": [{"name": "cpu_usage_active"}],
        "totalcpu": false
      },
      "disk": {
        "measurement": [{"name": "used_percent"}],
        "resources": ["*"]
      },
      "mem": {
        "measurement": [{"name": "mem_used_percent"}]
      }
    }
  }
}
```

**Start Agent:**
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json
```

### 4.3 Create CloudWatch Alarms
```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
    --alarm-name rythu-mitra-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2

# High memory alarm
aws cloudwatch put-metric-alarm \
    --alarm-name rythu-mitra-high-memory \
    --alarm-description "Alert when memory exceeds 85%" \
    --metric-name mem_used_percent \
    --namespace RythuMitra \
    --statistic Average \
    --period 300 \
    --threshold 85 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

---

## 5. S3 Model Storage

### 5.1 Create S3 Bucket
```bash
aws s3 mb s3://rythu-mitra-models --region us-east-1
```

### 5.2 Upload ML Models
```bash
# From local machine
aws s3 sync backend/ai/models/ s3://rythu-mitra-models/models/

# On EC2 (download models)
aws s3 sync s3://rythu-mitra-models/models/ /opt/rythu-mitra/backend/ai/models/
```

### 5.3 Configure Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEC2Access",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:role/RythuMitraEC2Role"
      },
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::rythu-mitra-models",
        "arn:aws:s3:::rythu-mitra-models/*"
      ]
    }
  ]
}
```

---

## 6. Troubleshooting

### 6.1 Container Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild
docker-compose build --no-cache <service-name>
docker-compose up -d <service-name>
```

**Database connection errors:**
```bash
# Check PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### 6.2 SSL Issues

**Certificate not working:**
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check Nginx config
docker-compose exec nginx nginx -t
```

### 6.3 Performance Issues

**High memory usage:**
```bash
# Check container stats
docker stats

# Increase swap
sudo swapoff -a
sudo dd if=/dev/zero of=/swapfile bs=1G count=8
sudo mkswap /swapfile
sudo swapon /swapfile
```

**Slow API responses:**
```bash
# Check Redis
docker-compose exec redis redis-cli ping

# Clear cache
docker-compose exec redis redis-cli FLUSHALL

# Check Celery workers
docker-compose logs celery_worker
```

### 6.4 Common Commands

```bash
# View all logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Clean everything
docker-compose down -v
docker system prune -a

# Database backup
docker-compose exec postgres pg_dump -U postgres rythu_mitra > backup_$(date +%Y%m%d).sql

# Database restore
cat backup.sql | docker-compose exec -T postgres psql -U postgres rythu_mitra
```

---

## 7. Scaling for Production

### 7.1 Horizontal Scaling
- Use AWS Application Load Balancer
- Create Auto Scaling Group
- Use RDS for PostgreSQL
- Use ElastiCache for Redis

### 7.2 Database Optimization
- Enable connection pooling
- Add read replicas
- Implement query caching
- Create proper indexes

### 7.3 CDN Setup
- Use CloudFront for static assets
- Configure cache headers
- Enable gzip compression

---

## 8. Security Checklist

- [ ] Change default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Configure firewall (UFW)
- [ ] Disable SSH password auth
- [ ] Enable automatic security updates
- [ ] Regular backup schedule
- [ ] Monitor CloudWatch logs
- [ ] Set up intrusion detection
- [ ] Regular security audits

---

## 9. Maintenance Schedule

### Daily
- Monitor CloudWatch metrics
- Check error logs
- Verify backup completion

### Weekly
- Review security logs
- Update dependencies
- Performance testing

### Monthly
- Security audit
- Database optimization
- Cost analysis

---

**For support, contact: support@rythumitra.com**
