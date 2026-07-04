# JM Pormar Frontend

Frontend Angular 22 con sitio público y panel administrativo integrado con la API Spring Boot.

## Desarrollo

Requiere Node.js 22.22.3 o superior compatible.

```bash
npm ci
npm start
```

La aplicación queda en `http://localhost:4200` y usa `proxy.conf.json` para redirigir `/api` a `http://localhost:8080`.

## Rutas

```text
/                                  web pública
/productos                         catálogo
/servicios                         servicios
/certificaciones                   certificaciones
/contacto                          contacto
/portal-jmp/login           login administrador
/portal-jmp/**                 panel protegido
```

## Build

```bash
npm run build
```

El Dockerfile compila con Node 22.22.3 y publica el resultado mediante Nginx.
