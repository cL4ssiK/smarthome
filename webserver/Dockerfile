# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Express Backend
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/ ./backend/

# Copy the React build from Stage 1 into the backend's public folder
# Adjust 'frontend/build' if you use Vite (use 'frontend/dist' instead)
COPY --from=frontend-builder /app/frontend/build ./backend/public

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "backend/server.js"]