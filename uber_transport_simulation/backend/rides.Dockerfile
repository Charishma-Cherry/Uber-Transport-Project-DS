# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    pkg-config \
    libmariadb-dev \
    librdkafka-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies from requirements.txt
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . /app/

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Expose port for the Django app
EXPOSE 8003
# Command to run the Django app
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && gunicorn uber_backend.wsgi:application --bind 0.0.0.0:8003"]
