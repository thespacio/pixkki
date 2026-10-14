import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly twoFactorInput: Locator;
  readonly submitButtonTwoFactor: Locator;
  readonly seccionDashboard: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /iniciar sesión/i });
    this.twoFactorInput = page.locator('input#twoFactorCode');
    this.submitButtonTwoFactor = page.getByRole('button', { name: 'Verificar código' })
    this.errorMessage = page.getByTestId('login-error');
    //Sections
    this.seccionDashboard = page.locator('section.dashboard');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    if (await this.twoFactorInput.isVisible({ timeout: 300000 }).catch(() => false)) {
      await this.twoFactorInput.fill('123456');
      await this.submitButtonTwoFactor.click();
    }
  }


}