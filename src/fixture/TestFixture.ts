import { test as base, expect, Locator } from '@playwright/test';
import { HomePage, ProductDetails, DiscountDetails } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { ShoppingBagPage } from '../pages/ShoppingBagPage';
import { CheckoutPage } from '../pages/CheckoutPage';

export type TestContext = {
    selectedProduct: ProductDetails;
    expectedSubtotal: number;
    discountDetails: DiscountDetails;
    parcelBoxToSelect: string;
};

export const test = base.extend<{
    cleanSession: void;
    homePage: HomePage;
    productPage: ProductPage;
    shoppingBagPage: ShoppingBagPage;
    checkoutPage: CheckoutPage;
    testContext: TestContext;
}>({
    cleanSession: [async ({ page }, use) => {
        console.log('Starting up for the test...');
        await page.context().clearCookies();

        await use();

        console.log('Cleaning up after the test...');
        await page.context().clearCookies();
    },
    { auto: true }],

    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    },
    productPage: async ({ page }, use) => {
        const productPage = new ProductPage(page);
        await use(productPage);
    },
    shoppingBagPage: async ({ page }, use) => {
        const shoppingBagPage = new ShoppingBagPage(page);
        await use(shoppingBagPage);
    },
    checkoutPage: async ({ page }, use) => {
        const checkoutPage = new CheckoutPage(page);
        await use(checkoutPage);
    },
    testContext: async ({}, use) => {
        const ctx: TestContext = {
            selectedProduct: { productName: '', productPrice: '' },
            expectedSubtotal: 0,
            discountDetails: { discountCode: '', discountPercentage: 0 },
            parcelBoxToSelect: ''
        };
        await use(ctx);
    }
});

export { expect, CheckoutPage, Locator };