#!/bin/bash
# start.sh - Entrypoint script for Render deployment
# This script runs Gunicorn with Uvicorn workers for production stability.

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Start the application using Gunicorn (production standard for FastAPI)
# Binding to 0.0.0.0 and port provided by Render (default 10000)
# Using 4 worker processes for concurrency
exec gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-10000}
