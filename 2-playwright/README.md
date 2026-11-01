# TP 2 – Test E2E con Playwright

Test end-to-end que entra al catálogo de la biblioteca de la Universidad de Mendoza, busca el libro **"UML y Patrones"** (Craig Larman) y comprueba que aparezca en los resultados.

## Qué es Playwright

Biblioteca de Microsoft para automatizar navegadores (Chromium, Firefox y WebKit) con una sola API. Espera automáticamente a que los elementos estén listos, lo que hace los tests más estables, y trae herramientas de depuración como el Inspector, el generador de código (codegen) y el Trace Viewer.

## Estructura (patrón Page Object)

```
2-playwright/
├── tests/biblioteca.spec.ts   # el test: pasos y aserción (expect)
├── pages/BibliotecaPage.ts    # Page Object: localizadores y acciones de la página
├── utils/datos.ts             # datos de prueba (el libro a buscar), fuera del test
└── playwright.config.ts       # configuración: URL, navegador, reportes, trazas
```

- **Page Object Model:** la página se representa con una clase que encapsula *cómo* se interactúa con la UI. El test solo dice *qué* se prueba. Si cambia la web, se toca solo el Page Object.
- **Selectores estables:** por rol y por texto (`getByRole`, `getByText`), no XPath ni CSS generados.
- **Datos fuera del test:** el título buscado está en `utils/datos.ts`.

## Cómo ejecutarlo

    cd 2-playwright
    npm install
    npx playwright install chromium
    npm test              # corre el test sin ventana
    npm run test:headed   # corre el test viendo el navegador
    npm run test:ui       # modo interactivo (ideal para mostrar en clase)
    npm run report        # abre el reporte HTML del último run
