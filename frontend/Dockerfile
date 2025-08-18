FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build-time environment variables
ARG VITE_BACKEND_URL
ARG VITE_MICROSOFT_CLIENT_ID
ARG VITE_MICROSOFT_TENANT_ID
ARG VITE_REDIRECT_URI

# Generate a temporary .env for Vite
RUN echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" > .env && \
    echo "VITE_MICROSOFT_CLIENT_ID=$VITE_MICROSOFT_CLIENT_ID" >> .env && \
    echo "VITE_MICROSOFT_TENANT_ID=$VITE_MICROSOFT_TENANT_ID" >> .env && \
    echo "VITE_REDIRECT_URI=$VITE_REDIRECT_URI" >> .env


RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
