# TP 5: Aplicación Web Progresiva (PWA)

**Blog UM**: una PWA hecha con **Ionic + Angular** (como el ejemplo de clase) que consume la **API REST de la app JHipster del TP 3**. Permite iniciar sesión, ver los posts, publicar uno nuevo y **seguir viendo los posts sin conexión**.

## Qué la hace una PWA

| Característica | Dónde está |
|----------------|------------|
| **Manifest**: nombre, ícono, colores y `display: standalone`, para instalarla como una app | `blog-pwa/public/manifest.webmanifest` |
| **Service worker**: guarda la app (HTML, JS, CSS, íconos) para que abra sin conexión | Lo genera Angular (`ng add @angular/pwa`) y se configura en `blog-pwa/ngsw-config.json` |
| **Caché de la API** con estrategia *freshness*: primero intenta la red y, si no hay conexión o tarda más de 5 s, usa los datos guardados (hasta 3 días) | `dataGroups` en `ngsw-config.json`, igual que en el ejemplo de clase |
| **Diseño adaptable** para celular, con componentes de Ionic | `blog-pwa/src/app/pages/` |
| **Aviso de modo offline** y botón de publicar deshabilitado sin conexión | `ConexionService` + `posts.page.ts` |

```json
"dataGroups": [{
  "name": "api-blog",
  "urls": ["http://localhost:8080/api/posts**", "http://localhost:8080/api/blogs**"],
  "cacheConfig": { "strategy": "freshness", "maxSize": 100, "maxAge": "3d", "timeout": "5s" }
}]
```

## Cómo consume la API

| Acción | Llamada a JHipster |
|--------|--------------------|
| Login | `POST /api/authenticate` → devuelve un **JWT**, que se guarda en `localStorage` |
| Listar posts | `GET /api/posts?sort=date,desc` |
| Listar blogs (para el formulario) | `GET /api/blogs` |
| Publicar un post | `POST /api/posts` |

Un **interceptor HTTP** (`auth.interceptor.ts`) agrega `Authorization: Bearer <token>` a cada llamada, y un **guard** (`auth.guard.ts`) manda al login si no hay sesión. JHipster ya permite pedidos (CORS) desde `http://localhost:8100`, el puerto que usa Ionic por defecto.

## Estructura

```
blog-pwa/src/app/
├── api.config.ts               # URL de la API (http://localhost:8080/api)
├── app.config.ts               # Router, HttpClient + interceptor, Ionic y service worker
├── app.routes.ts               # /login, /posts y /nuevo-post (con guard)
├── services/
│   ├── auth.service.ts         # Login y token JWT
│   ├── auth.interceptor.ts     # Agrega el token a cada pedido
│   ├── auth.guard.ts           # Protege las páginas que necesitan sesión
│   ├── blog-api.service.ts     # Llamadas a /api/posts y /api/blogs
│   └── conexion.service.ts     # Detecta si hay conexión (online/offline)
└── pages/
    ├── login/                  # Formulario de inicio de sesión
    ├── posts/                  # Lista de posts (con "tirar para actualizar")
    └── nuevo-post/             # Formulario para publicar
```

## Cómo ejecutarla

1. Levantar la **app JHipster** del TP 3 (no hace falta ELK):

       cd 3-jhipster-elk/blog
       ./mvnw

2. Instalar dependencias de la PWA (la primera vez):

       cd 5-pwa/blog-pwa
       npm install

3. Compilar para producción y servirla en el puerto 8100. El service worker **solo funciona en el build de producción**, por eso no se usa `ng serve`:

       npm run serve:pwa

4. Abrir http://localhost:8100 en Chrome e ingresar con `admin` / `admin`.

## Qué mostrar

1. **Que es instalable:** en Chrome aparece el ícono de *Instalar* en la barra de direcciones. Al instalarla, abre en su propia ventana, sin barra del navegador.
2. **Manifest y service worker:** F12 → pestaña **Application** → *Manifest* y *Service workers* (debe figurar `ngsw-worker.js` activo). En *Cache storage* se ven las cachés de la app y de la API.
3. **Consumo de la API:** publicar un post desde la PWA y verlo también en la app JHipster (http://localhost:8080 → Entidades → Post).
4. **Modo offline:** F12 → **Network** → *Offline* y recargar la página. La app abre igual, muestra los posts guardados y el aviso amarillo *"Sin conexión"*.

## Decisiones

- **Angular 21** en lugar de 22: Angular 22 pide Node 24.15 o superior, y así funciona con Node 24.10.
- **Ionic sin el starter:** se agregaron los componentes de Ionic 9 a un proyecto Angular CLI (`provideIonicAngular`). En Ionic 9 los componentes standalone se importan desde `@ionic/angular`.
- **Rutas con `#`** (`/#/posts`): funcionan con cualquier servidor estático, como `http-server`, sin configurar redirecciones.
