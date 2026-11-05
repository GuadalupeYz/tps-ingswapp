import { test, expect } from '@playwright/test';
import { InfobaePage } from '../pages/InfobaePage';
import { datos } from '../utils/datos';

/**
 * Objetivo: comprobar que un usuario puede ingresar a un diario digital,
 * acceder a la sección Tecnología y abrir una noticia.
 */
test('un usuario llega desde la portada de Infobae hasta una noticia de Tecnología', async ({ page }) => {
  const infobae = new InfobaePage(page);
  let tituloEnListado = '';

  await test.step('Ingresar a Infobae y comprobar que cargó la portada', async () => {
    await infobae.abrirPortada();
    await expect(page).toHaveTitle(datos.tituloPortada);
    // La navegación está disponible: el link de Tecnología o el botón del menú
    await expect(infobae.linkTecnologia.or(infobae.botonMenu).first()).toBeVisible();
  });

  await test.step('Acceder a la sección Tecnología', async () => {
    await infobae.irASeccionTecnologia();
    await expect(page).toHaveURL(datos.urlSeccion);
    await expect(page).toHaveTitle(datos.tituloSeccion);
    await expect(infobae.noticiasDeTecnologia.first()).toBeVisible();
  });

  await test.step('Seleccionar una noticia', async () => {
    tituloEnListado = await infobae.abrirPrimeraNoticia();
  });

  await test.step('Comprobar que se abrió la noticia y aparece su título', async () => {
    await expect(page).toHaveURL(datos.urlNoticia);
    await expect(infobae.tituloNoticia).toBeVisible();
    // El título de la nota es el mismo que se veía en el listado de la sección
    await expect(infobae.tituloNoticia).toContainText(tituloEnListado);
  });
});
