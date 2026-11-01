import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object del catálogo de la biblioteca de la UM (Koha OPAC).
 * Encapsula los localizadores y las acciones; las aserciones quedan en el test.
 * Selectores obtenidos con `npx playwright codegen`.
 */
export class BibliotecaPage {
  readonly page: Page;
  readonly campoBusqueda: Locator;
  readonly mensajeVerificacion: Locator;
  readonly camposAvanzada: Locator;
  readonly botonBuscarAvanzada: Locator;
  readonly paginaDeResultados: Locator;

  constructor(page: Page) {
    this.page = page;
    this.campoBusqueda = page.locator('#translControl1');
    this.mensajeVerificacion = page.getByText(/Verificación fallida/i);
    this.camposAvanzada = page.getByRole('textbox', { name: 'Ingrese términos de búsqueda' });
    this.botonBuscarAvanzada = page.getByRole('button', { name: 'Buscar' }).first();
    // Lista de resultados o ficha del libro (Koha va directo a la ficha si hay una sola coincidencia)
    this.paginaDeResultados = page.locator('#numresults, .searchresults, #catalogue_detail_biblio');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Búsqueda simple desde la caja principal. */
  async buscar(texto: string) {
    await this.campoBusqueda.fill(texto);
    await this.campoBusqueda.press('Enter');
  }

  /** Búsqueda avanzada: completa un campo por término y presiona Buscar. */
  async buscarAvanzada(terminos: string[]) {
    for (const [i, termino] of terminos.entries()) {
      await this.camposAvanzada.nth(i).fill(termino);
    }
    await this.botonBuscarAvanzada.click();
  }

  /**
   * A veces la búsqueda simple responde "Verificación fallida" y muestra
   * el formulario de búsqueda avanzada. En ese caso se sigue por ahí,
   * igual que haría un usuario.
   */
  async buscarLibro(texto: string, terminosAvanzada: string[]) {
    await this.buscar(texto);
    await this.mensajeVerificacion.or(this.paginaDeResultados).first().waitFor();
    if (await this.mensajeVerificacion.isVisible()) {
      await this.buscarAvanzada(terminosAvanzada);
    }
  }

  resultado(titulo: RegExp): Locator {
    return this.page.getByText(titulo).first();
  }
}
