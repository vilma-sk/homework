import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';


export class ProductPage extends BasePage {
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly increaseButton: Locator;
    readonly addToBagButton: Locator;

    constructor(page: Page) {
        super(page);
        this.productTitle = page.getByTestId('builder-product-section-title');
        this.productPrice = page.locator('.block-product__price .body-large');
        this.increaseButton = page.getByTestId('productpage-btn-increaseq');
        this.addToBagButton = page.getByTestId('productsection-btn-addtobag');
    }

    async addProductToBag(quantity: number): Promise<void> {
        for (let i = 1; i < quantity; i++) {
            await this.increaseButton.click();
        }
        await this.addToBagButton.click();
    }

}