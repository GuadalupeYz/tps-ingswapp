import { test, expect } from '@playwright/test';
import { BibliotecaPage } from '../pages/BibliotecaPage';
import { libroBuscado } from '../utils/datos';

// Si el catálogo pide CAPTCHA, cuánto tiempo se espera a que una persona lo resuelva.
const ESPERA_CAPTCHA_MS = 120_000;

test('el libro "UML y Patrones" existe en la biblioteca de la universidad', async ({ page }) => {
  test.setTimeout(ESPERA_CAPTCHA_MS + 60_000);
  const biblioteca = new BibliotecaPage(page);

  await biblioteca.goto();
  await biblioteca.buscar(libroBuscado.busqueda);

  if (biblioteca.esCaptcha()) {
    test.info().annotations.push({
      type: 'captcha',
      description: 'El catálogo pidió verificación humana; se resolvió manualmente.',
    });
    await biblioteca.esperarResolucionManualDelCaptcha(ESPERA_CAPTCHA_MS);
  }

  await expect(biblioteca.resultado(libroBuscado.tituloEsperado)).toBeVisible();
});
