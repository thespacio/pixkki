import { test, expect, qaMeta } from '../fixtures';
import AxeBuilder from '@axe-core/playwright';

// Matriz de pruebas — fila 19: "Cumplimiento WCAG básico".
// Escaneo automático con axe-core (reglas WCAG 2.1 A/AA). Esto cubre
// contraste, textos alternativos y estructura semántica de forma
// automatizada; no reemplaza una prueba manual con lector de pantalla
// (ver fila 30 de la matriz, marcada como pendiente).
test.describe('Accesibilidad (WCAG básico)', () => {

  test('La landing page no tiene violaciones WCAG 2.1 A/AA detectables', qaMeta({
    id: 'TC-A01',
    categoria: 'Funcional',
    criterio: 'Contraste adecuado, textos alternativos y navegación por teclado — sin violaciones WCAG 2.1 A/AA detectadas por escaneo automático.',
    prioridad: 'Media',
  }), async ({ page }, testInfo) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const resumen = results.violations.map(v => `${v.id} (${v.impact}): ${v.nodes.length} elemento(s)`).join(' | ');
    testInfo.annotations.push({ type: 'notas', description: resumen || 'Sin violaciones detectadas' });

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('La página de login no tiene violaciones WCAG 2.1 A/AA detectables', qaMeta({
    id: 'TC-A02',
    categoria: 'Funcional',
    criterio: 'Contraste adecuado, textos alternativos y navegación por teclado — sin violaciones WCAG 2.1 A/AA detectadas por escaneo automático.',
    prioridad: 'Media',
  }), async ({ page }, testInfo) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const resumen = results.violations.map(v => `${v.id} (${v.impact}): ${v.nodes.length} elemento(s)`).join(' | ');
    testInfo.annotations.push({ type: 'notas', description: resumen || 'Sin violaciones detectadas' });

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

});
