# Deploying on TrueNAS SCALE

## Architecture

Two containers, one exposed port:

| Container | Role | Exposed |
|-----------|------|---------|
| `fitness-frontend` | SvelteKit app + `/api/*` proxy | port 3000 |
| `fitness-backend` | FastAPI + SQLite | internal only |

Put a reverse proxy in front of port 3000 for HTTPS.

---

## 1. Create a Dataset

In the TrueNAS web UI, create a dataset to hold the SQLite database and your CSV file. This survives container rebuilds and is backed up with your pool.

**Storage → Pools → your pool → Add Dataset**

Suggested path: `/mnt/POOL/fitness`

Inside it, create two subdirectories via SSH:

```bash
mkdir -p /mnt/POOL/fitness/db
mkdir -p /mnt/POOL/fitness/seed
```

Copy your workout CSV into the seed directory:

```bash
cp your-export.csv /mnt/POOL/fitness/seed/data.csv
```

If you don't have data yet, use the sample:

```bash
curl -o /mnt/POOL/fitness/seed/data.csv \
  https://raw.githubusercontent.com/DeastinY/strong-fitness-webapp/main/data.sample.csv
```

---

## 2. Create the Compose File

```bash
mkdir -p /mnt/POOL/fitness
cat > /mnt/POOL/fitness/docker-compose.yml << 'EOF'
services:
  backend:
    image: ghcr.io/deastiny/strong-fitness-webapp-backend:latest
    container_name: fitness-backend
    restart: unless-stopped
    expose:
      - "8000"
    volumes:
      - /mnt/POOL/fitness/db:/app/data
      - /mnt/POOL/fitness/seed/data.csv:/app/seed/data.csv:ro
    environment:
      - DATABASE_URL=sqlite:///./data/fitness.db
      - SEED_CSV_PATH=/app/seed/data.csv
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: ghcr.io/deastiny/strong-fitness-webapp-frontend:latest
    container_name: fitness-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - ORIGIN=https://fitness.yourdomain.com
      - API_BACKEND=http://backend:8000

EOF
```

Replace `POOL` with your pool name and set `ORIGIN` to the URL you'll access the app from (or `http://TRUENAS_IP:3000` if not using a domain).

---

## 3. Start the App

```bash
cd /mnt/POOL/fitness
docker compose pull
docker compose up -d
```

Check it's running:

```bash
docker compose ps
docker compose logs -f
```

The backend seeds the database from `data.csv` on first start (only if the DB is empty). After that, new data is added through the Upload page in the UI.

---

## 4. Reverse Proxy (HTTPS)

You only need to proxy port 3000. Two common options on TrueNAS SCALE:

### Option A — Nginx Proxy Manager (recommended)

Install the **Nginx Proxy Manager** app from the TrueNAS app catalog, then add a proxy host:

- **Domain:** `fitness.yourdomain.com`
- **Scheme:** `http`
- **Forward hostname:** IP of your TrueNAS (or `localhost` if NPM runs on the same host)
- **Forward port:** `3000`
- Enable **SSL** with Let's Encrypt

### Option B — Caddy (manual, automatic HTTPS)

```bash
docker run -d \
  --name caddy \
  --network host \
  -v /mnt/POOL/caddy/data:/data \
  -v /mnt/POOL/caddy/config:/config \
  caddy caddy reverse-proxy \
    --from fitness.yourdomain.com \
    --to localhost:3000
```

### Option C — Nginx (manual)

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

---

## 5. Auto-start on Boot

TrueNAS SCALE does not automatically restart `docker compose` projects after a reboot unless you configure it. Add a startup script via **System → Init/Shutdown Scripts**:

- **Type:** `Command`
- **Command:** `docker compose -f /mnt/POOL/fitness/docker-compose.yml up -d`
- **When:** `Post Init`

---

## Updating

```bash
cd /mnt/POOL/fitness
docker compose pull          # fetch latest images
docker compose up -d         # recreate containers
docker image prune -f        # clean up old layers
```

The database is stored in the dataset, not in the container, so updates never lose data.

---

## Backup and Restore

**Backup the database:**

```bash
cp /mnt/POOL/fitness/db/fitness.db /mnt/POOL/fitness/fitness.db.bak
```

Or include it in your pool's ZFS snapshot schedule — it's just a file in the dataset.

**Restore:**

```bash
docker compose down
cp /mnt/POOL/fitness/fitness.db.bak /mnt/POOL/fitness/db/fitness.db
docker compose up -d
```

---

## Troubleshooting

```bash
# Tail all logs
docker compose -f /mnt/POOL/fitness/docker-compose.yml logs -f

# Check backend health
docker exec fitness-backend python -c \
  "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/').read())"

# Inspect the database
docker exec fitness-backend sqlite3 /app/data/fitness.db ".tables"

# Force re-seed (wipes existing data)
docker compose down
rm /mnt/POOL/fitness/db/fitness.db
docker compose up -d
```
