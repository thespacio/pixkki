import { test, expect, qaMeta } from '../fixtures';
import { measureNavigation, annotateTiming } from '../../utils/performance';

// Umbrales pensados para el servidor de desarrollo (next dev, sin build de producción),
// que es más lento que producción por la compilación on-demand. Si en algún momento
// estas pruebas corren contra un build de producción (`next build && next start`),
// conviene bajar los umbrales para que sigan siendo exigentes.
const UMBRAL_PAGINA_PUBLICA_MS = 8000;
const UMBRAL_PAGINA_AUTENTICADA_MS = 8000;

test.describe('Rendimiento de carga de páginas', () => {

  test('La landing page carga dentro del umbral aceptable', qaMeta({
    id: 'TC-P01',
    categoria: 'Rendimiento',
    criterio: `El evento "load" de la landing page (/) ocurre en menos de ${UMBRAL_PAGINA_PUBLICA_MS} ms.`,
    prioridad: 'Media',
  }), async ({ page }, testInfo) => {
    const timing = await measureNavigation(page, '/');
    annotateTiming(testInfo, timing);

    expect(timing.load).toBeLessThan(UMBRAL_PAGINA_PUBLICA_MS);
  });

  test('La página de login carga dentro del umbral aceptable', qaMeta({
    id: 'TC-P02',
    categoria: 'Rendimiento',
    criterio: `El evento "load" de /login ocurre en menos de ${UMBRAL_PAGINA_PUBLICA_MS} ms.`,
    prioridad: 'Media',
  }), async ({ page }, testInfo) => {
    const timing = await measureNavigation(page, '/login');
    annotateTiming(testInfo, timing);

    expect(timing.load).toBeLessThan(UMBRAL_PAGINA_PUBLICA_MS);
  });

  test('El dashboard carga dentro del umbral aceptable para un usuario autenticado', qaMeta({
    id: 'TC-P03',
    categoria: 'Rendimiento',
    criterio: `Con sesión iniciada, el evento "load" de /dashboard ocurre en menos de ${UMBRAL_PAGINA_AUTENTICADA_MS} ms.`,
    prioridad: 'Alta',
  }), async ({ page, authenticatedPage }, testInfo) => {
    const timing = await measureNavigation(page, '/dashboard');
    annotateTiming(testInfo, timing);

    expect(timing.load).toBeLessThan(UMBRAL_PAGINA_AUTENTICADA_MS);
  });

  test('La sección de animales carga dentro del umbral aceptable', qaMeta({
    id: 'TC-P04',
    categoria: 'Rendimiento',
    criterio: `Con sesión iniciada, el evento "load" de /animals ocurre en menos de ${UMBRAL_PAGINA_AUTENTICADA_MS} ms.`,
    prioridad: 'Media',
  }), async ({ page, authenticatedPage }, testInfo) => {
    const timing = await measureNavigation(page, '/animals');
    annotateTiming(testInfo, timing);

    expect(timing.load).toBeLessThan(UMBRAL_PAGINA_AUTENTICADA_MS);
  });

  // Matriz de pruebas — fila 7: "Tiempo de carga de la página principal ≤ 3s".
  // Umbral exacto pedido por la matriz (más estricto que TC-P01, que usa un
  // margen amplio pensado para next dev). Corre aparte para no perder ese
  // margen en TC-P01 y a la vez cumplir el criterio literal de la matriz.
  test('La página principal carga en 3 segundos o menos (criterio de la matriz)', qaMeta({
    id: 'TC-P05',
    categoria: 'Rendimiento',
    criterio: 'La página principal carga completamente en 3 segundos o menos.',
    prioridad: 'Alta',
  }), async ({ page }, testInfo) => {
    const timing = await measureNavigation(page, '/');
    annotateTiming(testInfo, timing);

    expect(timing.load).toBeLessThan(3000);
  });

  // Matriz de pruebas — fila 9: "Tiempo de respuesta de API ≤ 500ms".
  // Se usa /api/catalogs/animal-states porque es el único endpoint de la API
  // que existe y responde hoy (ver BUG-09 en el registro de defectos: /api/animals
  // no tiene ruta implementada en el backend).
  test('La API de catálogos responde en 500 ms o menos', qaMeta({
    id: 'TC-P06',
    categoria: 'Rendimiento',
    criterio: 'GET /api/catalogs/animal-states responde en 500 ms o menos.',
    prioridad: 'Media',
  }), async ({ page, authenticatedPage }, testInfo) => {
    const start = Date.now();
    const response = await page.request.get('/api/catalogs/animal-states');
    const elapsed = Date.now() - start;

    testInfo.annotations.push({ type: 'notas', description: `status=${response.status()} · tiempo=${elapsed}ms` });

    expect(response.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(500);
  });

});
