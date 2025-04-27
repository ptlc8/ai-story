FROM node:lts-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the code
COPY *.js ./

# Expose the port
EXPOSE 80

# Start the server
CMD ["node", "server.js"]
