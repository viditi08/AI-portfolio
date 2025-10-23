# Use a standard, stable Python version
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY the requirements file first to leverage Docker's build cache
# This path must match your project structure
COPY ai-portfolio/backend/requirements.txt .

# Install all your dependencies from requirements.txt
# This will correctly read the --extra-index-url for PyTorch
RUN pip install --no-cache-dir -r requirements.txt

# Now copy your entire backend directory into the container
# This copies main.py, the 'data' folder, etc.
COPY ai-portfolio/backend/ .

# Expose the port Hugging Face Spaces uses by default
EXPOSE 7860

# Command to run your app.
# We tell uvicorn to use the port HF provides.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]