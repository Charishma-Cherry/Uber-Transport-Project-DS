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
    supervisor \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies from requirements.txt
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . /app/

COPY supervisord_drivers.conf /etc/supervisor/conf.d/supervisord.conf

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Expose port for the Django app
EXPOSE 8002
# Command to run the Django app
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]