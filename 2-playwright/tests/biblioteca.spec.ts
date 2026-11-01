import { test, expect } from '@playwright/test';
import { BibliotecaPage } from '../pages/BibliotecaPage';
import { libroBuscado } from '../utils/datos';

test('el libro "UML y Patrones" existe en la biblioteca de la universidad', async ({ page }) => {
  const biblioteca = new BibliotecaPage(page);

  await biblioteca.goto();
  await biblioteca.buscarLibro(libroBuscado.busqueda, libroBuscado.terminosAvanzada);

  await expect(biblioteca.resultado(libroBuscado.tituloEsperado)).toBeVisible();
});
