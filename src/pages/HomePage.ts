import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type ProductDetails = {
    productName: string;
    productPrice: string;
};

export type DiscountDetails = {
    discountCode: string;
    discountPercentage: number;
};

export class HomePage extends BasePage {
    readonly productsContainer: Locator;
    readonly productItems: Locator;
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly discountCodeLocator: Locator;

    constructor(page: Page) {
        super(page);
        this.productsContainer = this.page.locator('.product-list__content');
        this.productItems = this.page.locator('.product-list__link');
        this.productTitle = this.page.getByTestId('product-list-section-item-title');
        this.productPrice = this.page.getByTestId('product-list-section-item-price');
        this.discountCodeLocator = this.page.locator('section.block-sticky-bar .body-small').first();
    }

    async openHomePage(): Promise<void> {
        await this.goToUrl(process.env.HOME_PAGE_URL!);
        await expect(this.productsContainer).toBeVisible();
        await this.dismissCookieBanner();
    }

    async selectProductByIndex(index: number): Promise<ProductDetails> {
        const count = await this.getProductsCount();
        if (index < 0 || index >= count) {
            throw new Error(`Product index ${index} out of bounds (count: ${count})`);
        }

        const targetItem = this.productItems.nth(index);

        const [productName, productPrice] = await Promise.all([
            this.requiredText(targetItem.locator(this.productTitle)),
            this.requiredText(targetItem.locator(this.productPrice))
        ]);

        await targetItem.click();

        return { productName, productPrice };
    }

    private async requiredText(locator: Locator): Promise<string> {
        const raw = await locator.textContent();
        if (raw === null) {
            throw new Error(`Expected textContent() but got null for locator: ${locator}`);
        }
        return raw.trim();
    }

    async getProductsCount(): Promise<number> {
        return await this.productItems.count();
    }

    async getAvailableDiscount(): Promise<DiscountDetails> {
        const rawText = (await this.discountCodeLocator.textContent())?.replace(/\s+/g, ' ').trim() || '';

        if (!rawText) {
            throw new Error('Discount banner text is not available.');
        }

        const percentageMatch = rawText.match(/(\d+(?:\.\d+)?)\s*%/i);
        const codeMatch = rawText.match(/(?:with\s+code|code)\s*[:\-]?\s*([a-z0-9_-]+)/i);

        const discountPercentage = percentageMatch ? Number(percentageMatch[1]) : 0;
        const discountCode = codeMatch ? codeMatch[1].toUpperCase() : '';

        return {
            discountCode,
            discountPercentage
        };
    }
}
