# ==========================
# ETAPA 1: COMPILAR ANGULAR
# ==========================

FROM node:24-bookworm-slim AS build

WORKDIR /app

# Primero copiamos los archivos de dependencias
# para aprovechar la caché de Docker.
COPY package.json package-lock.json ./

RUN node --version && npm --version

RUN npm ci --legacy-peer-deps

# Copiamos el código fuente.
COPY . .

# Compilación de producción.
RUN npm run build -- --configuration=production


# ==========================
# ETAPA 2: SERVIDOR NGINX
# ==========================

FROM nginx:alpine

# Reemplazamos la configuración predeterminada.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el resultado de Angular temporalmente.
COPY --from=build /app/dist/jm-pormar-frontend /tmp/dist

# Angular puede generar:
# dist/jm-pormar-frontend/browser
# o directamente dist/jm-pormar-frontend
RUN rm -rf /usr/share/nginx/html/* && \
    if [ -d /tmp/dist/browser ]; then \
        cp -r /tmp/dist/browser/. /usr/share/nginx/html/; \
    else \
        cp -r /tmp/dist/. /usr/share/nginx/html/; \
    fi && \
    rm -rf /tmp/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]