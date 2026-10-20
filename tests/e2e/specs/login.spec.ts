import { test, expect, qaMeta } from '../fixtures';
import { LandingPage } from '../pages/landing.page';
import { LoginPage } from '../pages/login.page';
import { DashboardPage, DASHBOARD_SECTIONS, PENDING_DASHBOARD_SECTIONS } from '../pages/dashboard.page';

test.describe('Go to Login Page', () => {

  test('Debería navegar a la página de inicio de sesión', qaMeta({
    id: 'TC-002',
    categoria: 'Funcional',
    criterio: 'Al hacer clic en el botón de Iniciar sesión desde la landing, el usuario hace login con credenciales válidas y accede al dashboard.',
    prioridad: 'Alta',
  }), async ({ page }) => {

    const landing = new LandingPage(page);
    const loginPage = new LoginPage(page);

    await landing.navigate();

    await landing.clickLogin();
    await page.waitForURL('/login', { waitUntil: 'load', timeout: 8000 });
    await expect(page).toHaveURL('/login');

    const emailInput = process.env.E2E_USER_EMAIL;
    const passwordInput = process.env.E2E_USER_PASSWORD;

    if (!emailInput || !passwordInput) {
      throw new Error('Faltan configurar las variables de entorno de prueba');
    }

    await loginPage.login(emailInput, passwordInput);

    await page.waitForURL('/dashboard', { waitUntil: 'load', timeout: 8000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('Debería mostrar un error con credenciales inválidas', qaMeta({
    id: 'TC-003',
    categoria: 'Seguridad',
    criterio: 'Al intentar iniciar sesión con contraseña incorrecta, el sistema rechaza el acceso, muestra "Correo o contraseña incorrecta".',
    prioridad: 'Alta',
  }), async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/login');

    await loginPage.login('Azul7935@gmail.com', 'ContraseñaIncorrecta123@');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Correo o contraseña incorrecta');
    await expect(page).toHaveURL('/login');
  });

  test('Debería mostrar las secciones del dashboard', qaMeta({
    id: 'TC-004',
    categoria: 'Funcional',
    criterio: 'Todas las secciones implementadas del menú lateral son visibles y navegables sin error 404 para un usuario autenticado.',
    prioridad: 'Alta',
  }), async ({ page, authenticatedPage }, testInfo) => {
    // Navega 7+ páginas en un solo test; con navegadores más lentos (firefox/webkit)
    // o el servidor de desarrollo bajo carga concurrente, el timeout por defecto
    // de 30s queda justo.
    testInfo.setTimeout(60000);

    await expect(page).toHaveURL('/dashboard');

    const dashboard = new DashboardPage(page);

    for (const section of DASHBOARD_SECTIONS) {
      await expect(dashboard.sectionLink(section.href), `Sección "${section.title}" visible en el menú`).toBeVisible();
    }

    for (const section of DASHBOARD_SECTIONS) {
      const response = await page.goto(section.href);
      expect(response?.status(), `Sección "${section.title}" (${section.href}) responde OK`).toBeLessThan(400);
      await expect(page.locator('h1.next-error-h1'), `Sección "${section.title}" (${section.href}) sin página 404`).toHaveCount(0);
    }
  });

  // Estas secciones ya están en el menú pero sus páginas todavía no existen (dan 404).
  // Sacar el .skip de cada caso cuando se implemente la ruta correspondiente.
  test.describe('Secciones pendientes de implementar', () => {
    const pendingIds = ['TC-005', 'TC-006', 'TC-007', 'TC-008'];

    PENDING_DASHBOARD_SECTIONS.forEach((section, i) => {
      test.skip(`"${section.title}" (${section.href}) todavía no tiene página`, qaMeta({
        id: pendingIds[i] ?? `TC-00${5 + i}`,
        categoria: 'Funcional',
        criterio: `La sección "${section.title}" (${section.href}) debe responder sin error 404 cuando se implemente su página.`,
        prioridad: 'Baja',
        notas: 'Pendiente: la página todavía no está implementada en la app (bug conocido, ver DashboardLayout).',
      }), async ({ page, authenticatedPage }) => {
        const response = await page.goto(section.href);
        expect(response?.status()).toBeLessThan(400);
      });
    });
  });

})