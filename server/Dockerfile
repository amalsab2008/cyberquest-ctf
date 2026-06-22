FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose API port
EXPOSE 5000

# Start server node
CMD ["npm", "start"]
