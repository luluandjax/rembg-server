# Start from a slim Python image
FROM python:3.9-slim

# Install required system packages and rembg
RUN apt-get update && \
    apt-get install -y ffmpeg libgl1 curl gnupg && \
    pip install rembg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Create app directory
WORKDIR /app

# Copy project files
COPY package*.json ./
COPY server.js ./

# Optional: copy these only if the folders exist
COPY public ./public
COPY uploads ./uploads

# Install node dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 10000

# Run your server
CMD ["node", "server.js"]
