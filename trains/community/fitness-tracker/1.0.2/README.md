# Fitness Tracker

Personal workout dashboard that visualises gym data exported from a fitness app (e.g. Strong).

## Features

- KPI cards: total workouts, weekly streak, total volume, average session duration
- Volume trend chart and monthly muscle group breakdown
- Per-exercise progress with estimated 1RM and last-session detail
- All-time personal records table, sortable by weight or estimated 1RM
- Cardio tracking: distance and duration per session
- 12-week consistency heatmap and weekly frequency charts
- Year filter (2025 / 2026 / All time)
- AI export: compact 3-month training log for pasting into ChatGPT or Claude
- Dark / light theme and kg / lbs unit toggle
- CSV upload page to import new workout data

## Data Format

The app ingests CSV files with these columns:

```
Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps, Distance, Seconds, RPE
```

The database starts empty. Upload your data through the **Upload** page in the app after installation.

## Configuration

| Field | Default | Description |
|-------|---------|-------------|
| Public URL | `http://localhost:3000` | The URL you will access the app from — must match what's in your browser |
| Port | `3000` | Host port to bind the web UI |
| Database Storage | ixVolume | Where to persist the SQLite database |

## Source

[github.com/DeastinY/strong-fitness-webapp](https://github.com/DeastinY/strong-fitness-webapp)
