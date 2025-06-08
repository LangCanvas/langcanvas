```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev # Install only production dependencies

COPY . .

# Build the React application using Vite
RUN npm run build # This will output to the 'dist' directory by default for Vite

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine as production-stage

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React application files from the 'dist' folder
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```
