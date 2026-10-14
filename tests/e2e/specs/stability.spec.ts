import { test, expect, qaMeta } from '../fixtures';

test.describe('Estabilidad', () => {

  // Matriz de pruebas — fila 20: "Manejo de errores 404 / 500".
  // Para un usuario ANÓNIMO, una ruta inexistente ni siquiera llega a mostrar
  // un 404: el middleware redirige cualquier ruta no autenticada a /login
  // (ver middleware.ts, isProtectedPath). Por eso esta prueba usa un usuario
  // autenticado, que es el caso donde sí se llega a ver el 404 real.
  test('Una ruta inexistente muestra un error sin tumbar la app (pero no está personalizado)', qaMeta({
    id: 'TC-E01',
    categoria: 'Funcional',
    criterio: 'Página de error 404 personalizada de la marca, sin caída del sistema.',
    prioridad: 'Media',
    notas: 'El sistema no cae (Falló el criterio de "personalizada"): se ve la página 404 genérica de Next.js, sin logo ni navegación de Pixkki.',
  }), async ({ page, authenticatedPage }) => {
    const response = await page.goto('/esta-ruta-no-existe-nunca');

    // No cae el servidor: responde con un 404 normal, no un 500 ni timeout.
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('404');

    // Evidencia de que es la página por defecto de Next.js, no una personalizada de Pixkki:
    await expect(page.locator('text=Pixkki')).toHaveCount(0);
  });

  // Matriz de pruebas — fila 33: "Recuperación tras pérdida de conexión".
  test('La app se recupera al volver la conexión tras quedarse offline', qaMeta({
    id: 'TC-E02',
    categoria: 'Funcional',
    criterio: 'La aplicación informa y recupera la sesión correctamente tras una pérdida de conexión.',
    prioridad: 'Media',
  }), async ({ page }) => {
    await page.goto('/');

    await page.context().setOffline(true);
    await expect(page.goto('/login')).rejects.toThrow();

    await page.context().setOffline(false);
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
  });

});
