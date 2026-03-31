import { Page, Locator, expect } from '@playwright/test';
import { ProductDetails } from './HomePage';
import { MoneyUtils } from '../utils/MoneyUtils';
import { BasePage } from './BasePage';

export class ShoppingBagPage extends BasePage {

    readonly checkoutButton: Locator;
    readonly productsContainer: Locator;
    readonly productItems: Locator;
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly productQuantity: Locator;
    readonly subTotalPrice: Locator;

    constructor(page: Page) {
        super(page);
        this.checkoutButton = page.getByTestId('shoppingcart-btn-checkout');
        this.productsContainer = page.locator('.cart__list');
        this.productItems = page.locator('.cart__list-item');
        this.productTitle = page.getByTestId('shoppingcart-text-product');
        this.productPrice = page.getByTestId('shoppingcart-text-price');
        this.productQuantity = page.getByTestId('shoppingcart-text-qty');
        this.subTotalPrice = page.getByTestId('shoppingcart-text-subtotal');
    }

    async getSelectedProductDetails(itemIndex: number = 0): Promise<ProductDetails> {
        await expect(this.productsContainer).toBeVisible();

        const targetItem = this.productItems.nth(itemIndex);
        await expect(targetItem).toBeVisible();

        const [productName, productPrice] = await Promise.all([
            this.productTitle.nth(itemIndex).textContent(),
            this.productPrice.nth(itemIndex).textContent()
        ]);

        if (productName === null || productPrice === null) {
            throw new Error('Product name or price textContent() returned null — UI not ready or selector incorrect.');
        }

        return {
            productName: productName.trim(),
            productPrice: productPrice.trim()
        };
    }

    async getSelectedProductQuantity(itemIndex: number = 0): Promise<number> {
        const targetItem = this.productItems.nth(itemIndex);
        await expect(targetItem).toBeVisible();
        return this.getQuantityFromItemInput(targetItem);
    }

    private async getQuantityFromItemInput(targetItem: Locator): Promise<number> {
        const inputValue = await targetItem.getByRole('textbox').first().inputValue();
        return parseInt(inputValue, 10);
    }

    async getSubTotalPrice(): Promise<number> {
        await expect(this.subTotalPrice).toBeVisible();

        const rawText = await this.subTotalPrice.textContent();
        if (rawText === null) {
            throw new Error('Subtotal textContent() returned null — UI not ready or selector incorrect.');
        }

        return MoneyUtils.toNumber(rawText.trim());
    }

    async proceedToCheckout(): Promise<void> {
        await expect(this.checkoutButton).toBeVisible();
        await this.checkoutButton.click();
    }
}
