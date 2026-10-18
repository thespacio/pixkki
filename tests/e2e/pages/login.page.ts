import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly twoFactorInput: Locator;
  readonly submitButtonTwoFactor: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /continuar/i });
    this.twoFactorInput = page.locator('input#twoFactorCode');
    this.submitButtonTwoFactor = page.getByRole('button', { name: 'Verificar código' })
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.twoFactorInput.fill('123456');
  }
}