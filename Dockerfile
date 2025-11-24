# ===================================================================
# FASE 1 – BUILD Angular
# ===================================================================
FROM node:18-alpine AS build

WORKDIR /app

# Copiamos package.json primero (optimiza cache)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos en modo producción
RUN npx ng build --configuration production


# ===================================================================
# FASE 2 – RUN: nginx para servir Angular compilado
# ===================================================================
FROM nginx:alpine

# Copiamos el build generado hacia la carpeta pública de NGINX
COPY --from=build /app/dist/clinica-frontend /usr/share/nginx/html

# Copiamos configuración de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
