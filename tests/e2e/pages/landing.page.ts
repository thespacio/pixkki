import { Page, Locator } from '@playwright/test';

export class LandingPage {
    readonly page: Page;
    readonly loginLink: Locator;
    readonly mainTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.mainTitle = page.getByRole('navigation').getByText('Pixkki')
        this.loginLink = page.getByRole('button', { name: /quiero donar/i });
    }

    async navigate() {
        await this.page.goto('/');
    }

    async clickLogin() {
        await this.loginLink.click();
    }
}