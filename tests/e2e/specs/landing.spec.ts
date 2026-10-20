import { test, expect, qaMeta } from '../fixtures';
import { LandingPage } from '../pages/landing.page';
import { LoginPage } from '../pages/login.page';

test.describe('Go to Landing Page', () => {

  test('Debería navegar a la página de inicio de sesión', qaMeta({
    id: 'TC-001',
    categoria: 'Funcional',
    criterio: 'Al entrar al sitio el usuario debe visualizar la landing page de Pixkki',
    prioridad: 'Alta',
  }), async ({ page }) => {

    const landing = new LandingPage(page);

    await landing.navigate();
    await expect(landing.mainTitle).toContainText('Pixkki');
  });
})
