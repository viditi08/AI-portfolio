# Use a standard, stable Python version
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY the requirements file first.
# The path is 'backend/requirements.txt' (relative to the Dockerfile)
COPY backend/requirements.txt .

# Install all your dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Now copy your entire backend directory into the container's /app folder
# This copies main.py, the 'data' folder, etc.
COPY backend/ .

# Expose the port Hugging Face Spaces uses by default
EXPOSE 7860

# Command to run your app.
# Uvicorn will find 'main.py' (with 'app' inside) in the /app directory
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]