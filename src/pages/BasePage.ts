import { Page } from '@playwright/test';

export abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goToUrl(url: string): Promise<void> {
        await this.page.goto(url);
    }

    async getPageTitle(): Promise<string> {
        return (await this.page.title()).trim();
    }

    async dismissCookieBanner(): Promise<void> {
        const acceptButton = this.page.locator('.cookie-banner').getByRole('button', { name: 'Accept' });
        if (await acceptButton.isVisible()) {
            await acceptButton.click();
        }
    }

}