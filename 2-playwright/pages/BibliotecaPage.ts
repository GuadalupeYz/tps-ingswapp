import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object del catálogo de la biblioteca.
 * Encapsula los localizadores y las acciones; las aserciones quedan en el test.
 */
export class BibliotecaPage {
  readonly page: Page;
  readonly campoBusqueda: Locator;
  readonly botonBuscar: Locator;
  readonly resultados: Locator;

  constructor(page: Page) {
    this.page = page;
    // TODO: ajustar con los selectores que genera `npx playwright codegen`
    this.campoBusqueda = page.getByRole('textbox').first();
    this.botonBuscar = page.getByRole('button', { name: /buscar/i });
    this.resultados = page.locator('body');
  }

  async goto() {
    await this.page.goto('/');
  }

  async buscar(texto: string) {
    await this.campoBusqueda.fill(texto);
    await this.botonBuscar.click();
  }

  resultado(titulo: RegExp): Locator {
    return this.resultados.getByText(titulo).first();
  }
}
