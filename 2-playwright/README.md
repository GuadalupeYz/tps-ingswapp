# TP 2: Test E2E con Playwright

Test *end-to-end* que simula a un usuario navegando un diario digital real: entra a **Infobae**, va a la sección **Tecnología**, abre una noticia y comprueba que se ve su título.

> La consigna original era buscar el libro "UML y Patrones" en la biblioteca de la universidad, pero el catálogo dejó de funcionar (respondía con una verificación anti-bots). Por indicación del profesor, el test se hizo sobre un diario digital.

## Objetivo del test

Comprobar que un usuario puede ingresar a un diario digital, acceder a la sección Tecnología y abrir una noticia.

| # | Paso | Qué comprueba el test |
|---|------|-----------------------|
| 1 | Abrir el navegador e ingresar a `https://www.infobae.com/` | Que la portada cargó: el título de la página contiene "Infobae" y el link **Tecno** del menú está visible |
| 2 | Acceder a la sección Tecnología | Que la URL termina en `/tecno/`, que el título de la página habla de Tecnología y que hay noticias listadas |
| 3 | Seleccionar una noticia | Guarda el título que se ve en el listado y hace clic en la primera nota |
| 4 | Comprobar que se abrió la noticia | Que la URL tiene la forma `/tecno/AAAA/MM/DD/...`, que el título (`h1`) está visible y que **coincide con el que se veía en el listado** |

**Resultado esperado:** el usuario llega desde la portada hasta una noticia de Tecnología y puede ver su contenido.

Cada paso está dentro de un `test.step(...)`, así en el reporte y en el modo UI se ve con nombre qué parte pasó o falló.

## Qué es Playwright

Biblioteca de Microsoft para automatizar navegadores (Chromium, Firefox y WebKit) con una sola API. **Espera automáticamente** a que los elementos estén listos antes de usarlos, lo que hace los tests más estables, y trae herramientas de depuración como el Inspector, el generador de código (`codegen`) y el Trace Viewer.

## Estructura (patrón Page Object)

```
2-playwright/
├── tests/infobae.spec.ts    # el test: los pasos y las aserciones (expect)
├── pages/InfobaePage.ts     # Page Object: localizadores y acciones sobre el diario
├── utils/datos.ts           # datos de prueba: nombre de la sección y patrones de URL
└── playwright.config.ts     # configuración: URL base, navegador, reportes, trazas
```

- **Page Object Model:** la clase `InfobaePage` sabe *cómo* se usa la página (dónde está el link de Tecnología, cómo se reconocen las noticias, dónde está el título). El test solo dice *qué* se quiere comprobar. Si Infobae cambia su diseño, se toca solo el Page Object.
- **Las aserciones van en el test**, no en el Page Object.
- **Selectores estables:** por rol y texto (`getByRole('link', { name: 'Tecno' })`) y por la forma de la URL de las notas (`/tecno/AAAA/...`), no por clases CSS que cambian seguido.
- **Datos fuera del test:** la sección y los patrones esperados están en `utils/datos.ts`.
- **El test no depende de una noticia en particular:** las notas cambian todo el tiempo, así que toma la primera que haya y compara su título en el listado con el de la página de la nota.
- **No depende de la edición:** Infobae redirige a una portada distinta según el país (Argentina, América, Estados Unidos). El test no verifica una URL exacta de portada, solo que sea Infobae.

## Cómo ejecutarlo

    cd 2-playwright
    npm install
    npx playwright install chromium
    npm test              # corre el test sin ventana
    npm run test:headed   # corre el test viendo el navegador
    npm run test:ui       # modo interactivo, paso a paso (ideal para mostrar en clase)
    npm run report        # abre el reporte HTML del último run

Si el test falla, Playwright guarda una captura, un video y una traza del intento en `test-results/` para ver qué pasó.
