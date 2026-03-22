FROM python:3.11-slim

WORKDIR /app

# System dependencies for some ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Add gunicorn to  requirements.txt or install it here
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

# Ensure the instance folder exists for SQLite
RUN mkdir -p instance

EXPOSE 5000

# Use Gunicorn: 2 workers
# 'app:app' means look in app.py for the 'app' variable.
# one wroker for 1GB RAM ?
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "app:app"]