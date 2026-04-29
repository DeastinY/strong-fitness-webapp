# Fitness Tracker

Personal workout dashboard that visualizes gym data exported from a fitness tracking app.

## Stack

- **Frontend** — SvelteKit, Tailwind CSS, Chart.js
- **Backend** — FastAPI, SQLite
- **Deployment** — Docker Compose (single exposed port)

## Features

- KPI cards: total workouts, training streak, total volume, avg session duration
- Volume trend chart and muscle group breakdown with month-over-month trends
- Volume per muscle group over time (monthly trend chart)
- Workout calendar and 12-week consistency heatmap
- Per-exercise progress tracking with 1RM estimates and last-session detail
- All-time personal records table (sortable by weight or estimated 1RM)
- Cardio tracking: distance and duration per session
- Year filter to switch between years or view all time
- AI export: compact 3-month training log for pasting into an LLM
- CSV upload to add new workout data
- Dark/light theme and kg/lbs unit toggle

## Data Format

The app ingests CSV exports with these columns:

```
Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps, Distance, Seconds, RPE
```

- `Set Order` accepts integers (`1`, `2`, `3`) or `F` for failure sets
- `Distance` and `Seconds` are used for cardio exercises (e.g. Elliptical Machine)
- `RPE` is optional (1–10 scale)
- On first startup the backend auto-seeds from `data.csv` if the database is empty

A sample file is provided at [`data.sample.csv`](data.sample.csv).

## Quick Install (no clone needed)

```bash
# 1. Download the compose file
curl -O https://raw.githubusercontent.com/DeastinY/strong-fitness-webapp/main/docker-compose.ghcr.yml

# 2. Add your workout CSV (see data.sample.csv for the expected format)
cp your-export.csv data.csv

# 3. Run
docker compose -f docker-compose.ghcr.yml up -d
```

Open [http://localhost:3000](http://localhost:3000). Pre-built images are pulled from `ghcr.io` — no local build required.

## Running Locally (from source)

```bash
cp data.sample.csv data.csv      # or use your own export
docker compose up --build
```

To use your own data, replace `data.csv` before the first run (or while the DB volume is empty). You can also upload a CSV through the UI at any time.

### Python / Node (for development)

**Backend** — runs on `http://localhost:8000`:

```bash
cd backend
mkdir -p data
SEED_CSV_PATH=../data.csv uv run uvicorn app.main:app --reload
```

The SQLite database is created at `backend/data/fitness.db`. On first run it auto-seeds from `data.csv`.

**Frontend** — runs on `http://localhost:5173`:

```bash
cd frontend
npm install
API_BACKEND=http://localhost:8000 npm run dev
```

`API_BACKEND` tells the SvelteKit server where to proxy `/api/*` requests. Both services must be running at the same time.

## Deployment on TrueNAS SCALE

See [DEPLOY.md](DEPLOY.md) for full instructions: dataset setup, pre-built image install, reverse proxy (Nginx Proxy Manager / Caddy), auto-start on boot, backup, and troubleshooting.

## Project Structure

```
├── data.sample.csv       # example data format
├── docker-compose.yml
├── backend/
│   └── app/
│       ├── models.py     # SQLAlchemy models (Workout, Exercise, Set)
│       ├── routes/       # workouts, exercises, upload endpoints
│       └── services/
│           ├── csv_parser.py
│           └── analytics.py
└── frontend/
    └── src/
        ├── routes/       # dashboard, workouts, exercises, records, upload
        └── lib/
            ├── api.ts
            ├── types.ts
            └── components/
                ├── charts/
                └── dashboard/
```
