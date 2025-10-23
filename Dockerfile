# Use a standard, stable Python version
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY the requirements file first.
COPY backend/requirements.txt .

# --- ADD THIS LINE ---
# This line forces Docker to re-run the next step instead of using a cache
ARG CACHE_BUSTER=1
# --- END OF ADDITION ---

# Install all your dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Now copy your entire backend directory...
COPY backend/ .

# Expose the port...
EXPOSE 7860

# Command to run your app.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]