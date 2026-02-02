# Use the slim version of 3.11 to save RAM and Disk space on your 4GB VM
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your code, including the model_orientation.pkl
COPY . .

EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]