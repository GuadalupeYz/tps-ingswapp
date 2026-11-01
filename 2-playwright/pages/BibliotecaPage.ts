import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object del catálogo de la biblioteca de la UM (Koha OPAC).
 * Encapsula los localizadores y las acciones; las aserciones quedan en el test.
 * Selectores obtenidos con `npx playwright codegen`.
 */
export class BibliotecaPage {
  readonly page: Page;
  readonly campoBusqueda: Locator;
  readonly paginaDeResultados: Locator;

  constructor(page: Page) {
    this.page = page;
    this.campoBusqueda = page.locator('#translControl1');
    // Lista de resultados o ficha del libro (Koha va directo a la ficha si hay una sola coincidencia)
    this.paginaDeResultados = page.locator('#numresults, .searchresults, #catalogue_detail_biblio');
  }

  async goto() {
    await this.page.goto('/');
  }

  async buscar(texto: string) {
    await this.campoBusqueda.fill(texto);
    await this.campoBusqueda.press('Enter');
    await this.page.waitForLoadState();
  }

  /** Espera a que la búsqueda termine en resultados o en la página de CAPTCHA. */
  async esperarRespuesta(): Promise<'resultados' | 'captcha'> {
    return Promise.race([
      this.paginaDeResultados.first().waitFor().then(() => 'resultados' as const),
      this.page.waitForURL(/verify-captcha/).then(() => 'captcha' as const),
    ]);
  }

  /**
   * El catálogo puede pedir un CAPTCHA (/verify-captcha) para frenar a los bots.
   * El test NO intenta saltearlo: se espera a que una persona lo resuelva
   * en la ventana del navegador (modo --headed o --ui) y después continúa.
   */
  async esperarResolucionManualDelCaptcha(timeoutMs: number) {
    await this.page.waitForURL((url) => !url.pathname.includes('verify-captcha'), {
      timeout: timeoutMs,
    });
    await this.paginaDeResultados.first().waitFor({ timeout: timeoutMs });
  }

  resultado(titulo: RegExp): Locator {
    return this.page.getByText(titulo).first();
  }
}
