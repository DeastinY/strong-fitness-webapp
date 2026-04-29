# Fitness Tracker

Personal workout dashboard that visualizes gym data exported from a fitness tracking app.

## Stack

- **Frontend** — SvelteKit, Tailwind CSS, Chart.js
- **Backend** — FastAPI, SQLite
- **Deployment** — Docker Compose (single exposed port)

## Features

- KPI cards: total workouts, training streak, total volume, avg session duration
- Volume over time chart and muscle group breakdown
- Per-exercise progress tracking with 1RM estimates
- Workout calendar and session history
- Body diagram highlighting trained muscle groups
- Dark/light theme and kg/lbs unit toggle
- CSV upload to add new workout data

## Data Format

The app ingests CSV exports with these columns:

```
Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps, Distance, Seconds, RPE
```

`Set Order` accepts integers (`1`, `2`, `3`) or `F` for failure sets. On first startup the backend auto-seeds from `data.csv` if the database is empty.

## Running Locally

### Docker (simplest)

```bash
cp .env.example .env          # set ORIGIN=http://localhost:3000
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

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

## Deployment

See [DEPLOY.md](DEPLOY.md) for full instructions (TrueNAS / reverse proxy setup).

## Project Structure

```
├── data.csv              # workout data (seeded into DB on first run)
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
        ├── routes/       # dashboard, workouts, exercises, upload
        └── lib/
            └── components/
```
