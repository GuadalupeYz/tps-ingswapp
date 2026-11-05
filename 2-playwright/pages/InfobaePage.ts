import { type Page, type Locator } from '@playwright/test';
import { datos } from '../utils/datos';

/**
 * Page Object del diario Infobae.
 * Encapsula los localizadores y las acciones; las aserciones quedan en el test.
 */
export class InfobaePage {
  readonly page: Page;
  readonly linkTecnologia: Locator;
  readonly botonMenu: Locator;
  readonly noticiasDeTecnologia: Locator;
  readonly tituloNoticia: Locator;

  constructor(page: Page) {
    this.page = page;
    // Link "Tecno": según la edición y el ancho de pantalla está en la barra superior
    // o dentro del menú lateral (botón "Menu", las tres rayitas)
    this.linkTecnologia = page.getByRole('link', { name: datos.seccion }).filter({ visible: true }).first();
    this.botonMenu = page.getByRole('button', { name: 'Menu' }).filter({ visible: true }).first();
    // Links a notas de la sección: /tecno/AAAA/MM/DD/...
    this.noticiasDeTecnologia = page.locator('a[href*="/tecno/20"]').filter({ visible: true });
    // En la página de una noticia, el título es el encabezado principal
    this.tituloNoticia = page.locator('h1').first();
  }

  async abrirPortada() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /** Va a Tecnología como lo haría un usuario: desde la barra o, si no está, desde el menú. */
  async irASeccionTecnologia() {
    if (!(await this.linkTecnologia.isVisible())) {
      await this.botonMenu.click();
    }
    await this.linkTecnologia.click();
    await this.page.waitForURL(datos.urlSeccion);
  }

  /** Abre la primera noticia de la sección y devuelve el título que se veía en el listado. */
  async abrirPrimeraNoticia(): Promise<string> {
    const noticia = this.noticiasDeTecnologia.first();
    const encabezado = noticia.locator('h2').first();
    const titulo = (await encabezado.count()) > 0 ? await encabezado.innerText() : await noticia.innerText();
    await noticia.click();
    await this.page.waitForURL(datos.urlNoticia);
    return titulo.split('\n')[0].trim();
  }
}
