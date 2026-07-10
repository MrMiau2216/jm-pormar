FROM node:26-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN node -v && npm -v

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration=production


FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/jm-pormar-frontend /tmp/dist

RUN rm -rf /usr/share/nginx/html/* && \
    if [ -d /tmp/dist/browser ]; then \
      cp -r /tmp/dist/browser/* /usr/share/nginx/html/; \
    else \
      cp -r /tmp/dist/* /usr/share/nginx/html/; \
    fi

EXPOSE 80