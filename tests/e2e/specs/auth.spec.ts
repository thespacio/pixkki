import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { LoginPage } from '../pages/login.page';

test.describe('Flujo de Acceso Principal - Pixkki', () => {

  test('Debería navegar a la landing page e iniciar sesión', async ({ page }) => {

    const landing = new LandingPage(page);
    const loginPage = new LoginPage(page);

    await landing.navigate();
    await expect(landing.mainTitle).toContainText('Pixkki');
    
    await landing.clickLogin();
    await page.waitForURL('/auth/login', { waitUntil: 'load', timeout: 8000 });
    await expect(page).toHaveURL('/auth/login');

    const emailInput = process.env.E2E_USER_EMAIL;
    const passwordInput = process.env.E2E_USER_PASSWORD;

    if (!emailInput || !passwordInput) {
      throw new Error('Faltan configurar las variables de entorno de prueba');
    }

    await loginPage.login(emailInput, passwordInput);
  });

})