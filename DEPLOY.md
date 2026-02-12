# Deploying Fitness Tracker on TrueNAS

## Architecture

The app runs as two containers with internal API proxying:
- **Frontend** (port 3000) - Serves the web app and proxies `/api/*` to backend
- **Backend** (internal only) - FastAPI server, not exposed externally

You only need to expose **one port (3000)** to the outside world.

## Quick Start

### 1. Copy files to TrueNAS

```bash
scp -r /path/to/fitness/* admin@YOUR_TRUENAS_IP:/mnt/YOUR_POOL/apps/fitness/
```

### 2. Configure

```bash
ssh admin@YOUR_TRUENAS_IP
cd /mnt/YOUR_POOL/apps/fitness

# Create .env with your public URL
echo "ORIGIN=https://fitness.yourdomain.com" > .env
```

### 3. Build and run

```bash
docker compose up -d --build
```

### 4. Configure reverse proxy

Point your reverse proxy to port 3000. Example for **Nginx**:

```nginx
server {
    listen 443 ssl;
    server_name fitness.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Example for **Caddy** (automatic HTTPS):

```
fitness.yourdomain.com {
    reverse_proxy localhost:3000
}
```

### 5. Access

Open `https://fitness.yourdomain.com`

---

## Data Persistence

Workout data is stored in the `fitness-data` Docker volume.

**Backup:**
```bash
docker run --rm -v fitness-data:/data -v $(pwd):/backup alpine tar czf /backup/fitness-backup.tar.gz -C /data .
```

**Restore:**
```bash
docker run --rm -v fitness-data:/data -v $(pwd):/backup alpine tar xzf /backup/fitness-backup.tar.gz -C /data
```

---

## Updating

```bash
cd /mnt/YOUR_POOL/apps/fitness
git pull  # or copy new files
docker compose down
docker compose up -d --build
```

---

## Troubleshooting

**Check logs:**
```bash
docker compose logs -f
docker compose logs frontend
docker compose logs backend
```

**Check containers:**
```bash
docker compose ps
```

**Rebuild from scratch:**
```bash
docker compose down -v
docker compose up -d --build
```

**Test API internally:**
```bash
docker compose exec frontend wget -qO- http://backend:8000/
```
