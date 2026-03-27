#!/bin/bash
# setup_ssl.sh

domains=(rythumitra.com www.rythumitra.com)
email="admin@rythumitra.com"

echo "🔒 Requesting SSL for: ${domains[*]}"

# Prerequisite check
if ! grep -q "16.170.172.200" /etc/hosts && ! host rythumitra.com | grep -q "16.170.172.200"; then
  echo "⚠️  WARNING: DNS does not appear to point to 16.170.172.200 yet."
fi

# 1. Download Params
mkdir -p ./deployment/certbot/conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./deployment/certbot/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./deployment/certbot/conf/ssl-dhparams.pem"

# 2. Certbot Request
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $email \
    -d rythumitra.com -d www.rythumitra.com \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

# 3. Reload Nginx
docker compose exec nginx nginx -s reload

echo "✅ SSL Obtained."
