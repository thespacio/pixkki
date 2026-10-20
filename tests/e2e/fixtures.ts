import { test as base } from '@playwright/test';
import { LandingPage } from './pages/landing.page';
import { LoginPage } from './pages/login.page';

type Fixtures = {
  landingPage: LandingPage;
  loginPage: LoginPage;
  authenticatedPage: void;
};

export const test = base.extend<Fixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // Este fixture representa una página ya logueada y en /dashboard. Pedir en cualquier test:
  // test('...', async ({ page, authenticatedPage }) => { ... })
  authenticatedPage: async ({ page, loginPage }, use) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Faltan configurar las variables de entorno de prueba');
    }

    await page.goto('/login');
    await loginPage.login(email, password);
    await page.waitForURL('/dashboard', { waitUntil: 'load', timeout: 8000 });

    await use();
  },
});

export { expect } from '@playwright/test';

export type QaCategoria = 'Funcional' | 'Rendimiento' | 'Unitaria' | 'Seguridad';
export type QaPrioridad = 'Alta' | 'Media' | 'Baja';

export type QaMeta = {
  id: string;
  categoria: QaCategoria;
  criterio: string;
  prioridad: QaPrioridad;
  notas?: string;
};

/**
 * Adjunta los metadatos de QA (Id, Categoría, Criterio de aceptación, Prioridad, Notas)
 * a un test como annotations, para que el reporter HTML personalizado
 * (tests/e2e/reporters/qa-html-reporter.ts) los pueda leer.
 *
 * Uso: test('mi caso', qaMeta({ id: 'TC-001', categoria: 'Funcional', ... }), async ({ page }) => {...})
 */
export function qaMeta(meta: QaMeta) {
  return {
    annotation: [
      { type: 'id', description: meta.id },
      { type: 'categoria', description: meta.categoria },
      { type: 'criterio', description: meta.criterio },
      { type: 'prioridad', description: meta.prioridad },
      ...(meta.notas ? [{ type: 'notas', description: meta.notas }] : []),
    ],
  };
}
