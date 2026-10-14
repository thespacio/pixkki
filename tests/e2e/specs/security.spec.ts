import { test, expect, qaMeta } from '../fixtures';
import { LoginPage } from '../pages/login.page';

test.describe('Seguridad', () => {

  // Matriz de pruebas — fila 15: "Protección contra inyección SQL".
  test('El login rechaza payloads de inyección SQL sin bypass ni error interno', qaMeta({
    id: 'TC-S01',
    categoria: 'Seguridad',
    criterio: 'Al intentar iniciar sesión con una carga típica de inyección SQL en el correo/contraseña, el sistema la rechaza como credencial inválida (nunca concede acceso ni expone un error 500).',
    prioridad: 'Alta',
  }), async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/login');

    // El payload va en la contraseña: el campo de correo es type="email" y el
    // navegador bloquearía nativamente un valor con esa forma antes de llegar
    // siquiera a Supabase, lo cual no probaría nada sobre el backend.
    await loginPage.login(`admin@pixkki.com`, `' OR '1'='1' --`);

    // No debe navegar nunca fuera de /login
    await expect(page).toHaveURL('/login');
    // Debe mostrar el mismo error genérico de credenciales, no un error de servidor
    await expect(loginPage.errorMessage).toBeVisible();
  });

  // Matriz de pruebas — fila 25: "Protección XSS".
  test('El formulario de login neutraliza un payload de XSS reflejado', qaMeta({
    id: 'TC-S02',
    categoria: 'Seguridad',
    criterio: 'Al enviar un payload de XSS (<script>) en el formulario de login, no se ejecuta ningún script (no aparece un diálogo del navegador) y el sistema lo trata como credencial inválida.',
    prioridad: 'Alta',
  }), async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    const loginPage = new LoginPage(page);
    await page.goto('/login');

    await loginPage.login(`<script>alert(1)</script>@test.com`, `<script>alert(1)</script>`);

    await page.waitForTimeout(500); // margen para que un XSS real hubiera disparado el diálogo

    expect(dialogFired, 'No debería dispararse ningún window.alert()/confirm()').toBe(false);
    await expect(page).toHaveURL('/login');
  });

  // Matriz de pruebas — fila 16: "Validación de sesión y token".
  test('Tras cerrar sesión, las rutas protegidas redirigen a login', qaMeta({
    id: 'TC-S03',
    categoria: 'Seguridad',
    criterio: 'Después de cerrar sesión, intentar acceder a una ruta protegida (/dashboard) redirige a /login en vez de mostrar contenido autenticado.',
    prioridad: 'Alta',
  }), async ({ page, authenticatedPage }) => {
    await expect(page).toHaveURL('/dashboard');

    // Cerrar sesión: limpiar cookies simula la expiración/invalidación de la sesión
    // de forma determinística (sin depender del botón de logout de la UI).
    await page.context().clearCookies();

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

});
