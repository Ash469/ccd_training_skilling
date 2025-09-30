# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
ARG VITE_BACKEND_URL
ARG VITE_MICROSOFT_CLIENT_ID
ARG VITE_MICROSOFT_TENANT_ID
ARG VITE_REDIRECT_URI
RUN npm run build

# Stage 2: Setup Backend
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY ./backend/package*.json ./
RUN npm install --production
COPY ./backend ./

# Copy frontend build into backend public folder
COPY --from=frontend-build /app/frontend/dist /app/backend/src/public

EXPOSE 5001
CMD ["npm", "start"]
