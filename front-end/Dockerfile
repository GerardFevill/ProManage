# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copier les fichiers de build (Angular 19+ utilise un sous-dossier browser)
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# Copier la configuration NGINX personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Exposer le port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
