import { type Page, type Locator } from '@playwright/test';
import { datos } from '../utils/datos';

/**
 * Page Object del diario Infobae.
 * Encapsula los localizadores y las acciones; las aserciones quedan en el test.
 */
export class InfobaePage {
  readonly page: Page;
  readonly linkTecnologia: Locator;
  readonly noticiasDeTecnologia: Locator;
  readonly tituloNoticia: Locator;

  constructor(page: Page) {
    this.page = page;
    // Link "Tecno" del menú principal
    this.linkTecnologia = page.getByRole('link', { name: datos.seccion }).filter({ visible: true }).first();
    // Links a notas de la sección: /tecno/AAAA/MM/DD/...
    this.noticiasDeTecnologia = page.locator('a[href*="/tecno/20"]').filter({ visible: true });
    // En la página de una noticia, el título es el encabezado principal
    this.tituloNoticia = page.locator('h1').first();
  }

  async abrirPortada() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async irASeccionTecnologia() {
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
