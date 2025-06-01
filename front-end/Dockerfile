# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copier les fichiers de build
COPY --from=build /app/dist/front-end /usr/share/nginx/html
# Copier la configuration NGINX personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Exposer le port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
