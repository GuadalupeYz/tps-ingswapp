import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object del catálogo de la biblioteca de la UM (Koha OPAC).
 * Encapsula los localizadores y las acciones; las aserciones quedan en el test.
 */
export class BibliotecaPage {
  readonly page: Page;
  readonly campoBusqueda: Locator;

  constructor(page: Page) {
    this.page = page;
    // Campo de búsqueda principal de Koha (obtenido con `npx playwright codegen`)
    this.campoBusqueda = page.locator('#translControl1');
  }

  async goto() {
    await this.page.goto('/');
  }

  async buscar(texto: string) {
    await this.campoBusqueda.fill(texto);
    await this.campoBusqueda.press('Enter');
  }

  /**
   * Koha muestra una lista de resultados o, si hay una sola coincidencia,
   * va directo a la ficha del libro. En ambos casos el título aparece en la página.
   */
  resultado(titulo: RegExp): Locator {
    return this.page.getByText(titulo).first();
  }
}
