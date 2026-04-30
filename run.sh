#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    echo "Stopped."
}
trap cleanup EXIT INT TERM

echo "Starting backend..."
cd "$ROOT/backend"
API_BACKEND=http://localhost:8000 \
    .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting frontend..."
cd "$ROOT/frontend"
API_BACKEND=http://localhost:8000 \
    npm run dev -- --port 3000 &
FRONTEND_PID=$!

echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."
wait
