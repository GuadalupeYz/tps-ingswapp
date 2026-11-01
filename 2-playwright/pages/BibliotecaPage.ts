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
   * Busca el libro reaccionando a lo que muestre el catálogo, como haría un usuario:
   * - Resultados o ficha del libro: listo.
   * - Formulario de búsqueda avanzada: completa los términos y presiona Buscar.
   * - "Verificación fallida" (sin formulario): vuelve a la página anterior.
   * - Caja de búsqueda simple: vuelve a buscar.
   */
  async buscarLibro(texto: string, terminosAvanzada: string[], intentos = 4) {
    await this.buscar(texto);
    const formularioAvanzado = this.camposAvanzada.first();

    for (let i = 0; i < intentos; i++) {
      await this.paginaDeResultados
        .or(this.mensajeVerificacion)
        .or(formularioAvanzado)
        .or(this.campoBusqueda)
        .first()
        .waitFor();

      if (await this.paginaDeResultados.first().isVisible()) return;

      if (await formularioAvanzado.isVisible()) {
        await this.buscarAvanzada(terminosAvanzada);
      } else if (await this.mensajeVerificacion.isVisible()) {
        await this.page.goBack();
      } else {
        await this.buscar(texto);
      }
      await this.page.waitForLoadState();
    }
  }

  resultado(titulo: RegExp): Locator {
    return this.page.getByText(titulo).first();
  }
}
