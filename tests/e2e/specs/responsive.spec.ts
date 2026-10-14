import { test, expect, qaMeta } from '../fixtures';

// Matriz de pruebas — fila 12: "Diseño responsivo (móvil / tablet / escritorio)".
// Este archivo corre bajo 3 proyectos de Playwright con distinto viewport
// (ver playwright.config.ts): chromium (desktop), Mobile Chrome (Pixel 5) y
// Mobile Safari (iPhone 12) — el mismo test, tres tamaños de pantalla reales.
test.describe('Diseño responsivo', () => {

  test('La landing page no genera scroll horizontal ni oculta el CTA principal', qaMeta({
    id: 'TC-R01',
    categoria: 'Funcional',
    criterio: 'La interfaz se adapta correctamente sin scroll horizontal ni elementos ocultos, en móvil, tablet y escritorio.',
    prioridad: 'Alta',
  }), async ({ page }) => {
    await page.goto('/');

    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });

    expect(overflowX, 'No debería haber scroll horizontal').toBeLessThanOrEqual(1);
    await expect(page.getByRole('link', { name: /Iniciar Sesión/i })).toBeVisible();
  });

});
