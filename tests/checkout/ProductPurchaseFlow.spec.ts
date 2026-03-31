import { test, expect, TestContext, CheckoutPage, Locator } from '../../src/fixture/TestFixture';
import { MoneyUtils } from '../../src/utils/MoneyUtils';


import {
    assertInputDefaults,
    assertSelectDefaults,
    ensureAttributeIsValidated,
    validateError
} from '../../src/utils/FormValidationHelpers';

import {
    CHECKOUT_EXPECTED,
    INVALID_EMAILS,
    INVALID_PHONE_NUMBERS,
    UNACCEPTED_PHONE_NUMBERS,
    INVALID_POSTAL_CODES,
    INVALID_SPECIAL_REQUESTS
} from '../testdata/CheckoutTestData';

const selectedProductsCount = 2;
const errorMessage = CHECKOUT_EXPECTED.errorMessage;
const checkoutDefaults = CHECKOUT_EXPECTED.default;
const formPlaceholders = CHECKOUT_EXPECTED.placeholders;
const checkoutTestData = CHECKOUT_EXPECTED.testdata;

test.beforeEach(async ({ homePage, productPage, shoppingBagPage, testContext }) => {
    await test.step('Select product and go to checkout', async () => {
        await homePage.openHomePage();

        testContext.discountDetails = await homePage.getAvailableDiscount();

        const productCount = await homePage.getProductsCount();
        const randomIndex = Math.floor(Math.random() * productCount);

        testContext.selectedProduct = await homePage.selectProductByIndex(randomIndex);
        testContext.expectedSubtotal = MoneyUtils.toNumber(testContext.selectedProduct.productPrice) * selectedProductsCount;

        await productPage.addProductToBag(selectedProductsCount);

        await expect(shoppingBagPage.getSubTotalPrice()).resolves.toBe(testContext.expectedSubtotal);
        await expect(shoppingBagPage.getSelectedProductDetails()).resolves.toMatchObject({ productName: testContext.selectedProduct.productName });
        await expect(shoppingBagPage.getSelectedProductQuantity()).resolves.toBe(selectedProductsCount);

        await shoppingBagPage.proceedToCheckout();
    });
});

test('Checkout positive flow', { tag: ['@Smoke'] }, async ({ checkoutPage, testContext }) => {
    await test.step('Verify default/available checkout page field values', async () => {
        await assertInputDefaults(checkoutPage.emailInput, checkoutDefaults.email, formPlaceholders.email);
        await assertInputDefaults(checkoutPage.fullNameInput, checkoutDefaults.fullName, formPlaceholders.fullName);
        await assertSelectDefaults(checkoutPage.shippingDestinationSelect, checkoutDefaults.shippingDestination);
        await assertInputDefaults(checkoutPage.postalCodeInput, checkoutDefaults.postalCode, formPlaceholders.postalCode);
        await assertInputDefaults(checkoutPage.phoneInput, checkoutDefaults.phone, formPlaceholders.phone);
        await assertInputDefaults(checkoutPage.specialRequestsInput, checkoutDefaults.specialRequests, formPlaceholders.specialRequests);
        await assertInputDefaults(checkoutPage.discountInput, checkoutDefaults.discountCode, formPlaceholders.discountCode);

        await expect(checkoutPage.getSelectedPhoneCountryCode())
            .resolves.toBe(checkoutDefaults.phoneCountryCode);

        for (const method of CHECKOUT_EXPECTED.shippingMethod.options) {
            await expect(checkoutPage.getShippingMethod(method)).toBeVisible();
        }

        await expect(checkoutPage.getShippingDestinationOptions()).resolves.toContainEqual(checkoutDefaults.shippingDestination);

        await expect(checkoutPage.bankTransferOption).toHaveText(CHECKOUT_EXPECTED.payment.title);
        await expect(checkoutPage.getBankTransferFullText()).resolves.toContain(CHECKOUT_EXPECTED.payment.detailsText);
        await expect(checkoutPage.getBankTransferFullText()).resolves.toContain(CHECKOUT_EXPECTED.payment.footerText);

        await expect(checkoutPage.placeOrderButton).toBeEnabled();
        await expect(checkoutPage.getPageTitle()).resolves.toBe(CHECKOUT_EXPECTED.page.title);
    });

    await test.step('Fill form and verify persistence', async () => {
        await fillDeliveryForm(checkoutPage, testContext);

        await expect(checkoutPage.emailInput).toHaveValue(checkoutTestData.email);
        await expect(checkoutPage.shippingDestinationSelect).toHaveText(checkoutTestData.shippingDestination);
        await expect(checkoutPage.fullNameInput).toHaveValue(checkoutTestData.fullName);
        await expect(checkoutPage.postalCodeInput).toHaveValue(checkoutTestData.postalCode);
        await expect(checkoutPage.getSelectedPhoneCountryCode()).resolves.toBe(checkoutTestData.phoneCountryCode);
        await expect(checkoutPage.phoneInput).toHaveValue(checkoutTestData.phone);
        await expect(checkoutPage.specialRequestsInput).toHaveValue(checkoutTestData.specialRequests);
        await expect(checkoutPage.getShippingMethod(checkoutTestData.shippingMethod)).toBeChecked();
        await expect(checkoutPage.getSelectedParcelBoxOption(checkoutTestData.shippingMethod).then(t => t.toLowerCase())
        ).resolves.toContain(testContext.parcelBoxToSelect.toLowerCase());
    });

    await test.step('Apply valid discount and validate totals', async () => {
        const totalBeforeDiscount =
            testContext.expectedSubtotal + MoneyUtils.toNumber(await checkoutPage.getShippingAmount());

        await checkoutPage.applyDiscount(testContext.discountDetails.discountCode);
        await expect(checkoutPage.applyDiscountButton).toBeDisabled();

        const expectedDiscount = MoneyUtils.round(
            testContext.expectedSubtotal * (testContext.discountDetails.discountPercentage || 0) / 100
        );

        const subtotal = MoneyUtils.toNumber(await checkoutPage.getSubtotal());
        const discount = Math.abs(MoneyUtils.toNumber(await checkoutPage.getDiscountAmount()));
        const shipping = MoneyUtils.toNumber(await checkoutPage.getShippingAmount());

        const expectedTotal = testContext.expectedSubtotal + shipping - expectedDiscount;
        const total = MoneyUtils.toNumber(await checkoutPage.getTotalAmount());

        expect(total).toBe(subtotal + shipping - discount);
        expect(total).toBe(expectedTotal);

        await checkoutPage.removeDiscount();

        await expect(async () => {
            const total = MoneyUtils.toNumber(await checkoutPage.getTotalAmount());
            expect(total).toBe(totalBeforeDiscount);
        }).toPass();
    });

    await test.step('Place order', async () => {
        await placeOrderAndConfirm(checkoutPage);
    });
});

test('Checkout negative flow validations', { tag: ['@Regression'] }, async ({ checkoutPage, testContext }) => {
    await test.step('Verify required fields are validated', async () => {
        await checkoutPage.selectShippingMethod(checkoutTestData.shippingMethod);
        await checkoutPage.triggerValidation();

        await validateError(checkoutPage, checkoutPage.emailInput, errorMessage.emailInvalid);
        await validateError(checkoutPage, checkoutPage.fullNameInput, errorMessage.fullName);
        await validateError(checkoutPage, checkoutPage.phoneInput, errorMessage.phoneRequired);
        await validateError(checkoutPage, checkoutPage.specialRequestsInput, errorMessage.specialRequestsRequired);
        await validateError(checkoutPage, checkoutPage.parcelBoxForSelectedShippingMethod, errorMessage.parcelBoxRequired);
    });

    await test.step('Verify field-specific validations', async () => {
        await validateField(checkoutPage, checkoutPage.emailInput,           INVALID_EMAILS,           errorMessage.emailInvalid);
        await validateField(checkoutPage, checkoutPage.postalCodeInput,      INVALID_POSTAL_CODES,     errorMessage.postalCodeInvalid);
        await validateField(checkoutPage, checkoutPage.phoneInput,           INVALID_PHONE_NUMBERS,    errorMessage.phoneNumberInvalid,    true);
        await validateField(checkoutPage, checkoutPage.phoneInput,           UNACCEPTED_PHONE_NUMBERS, errorMessage.phoneRequired,         true);
        await validateField(checkoutPage, checkoutPage.specialRequestsInput, INVALID_SPECIAL_REQUESTS, errorMessage.specialRequestsInvalid);
    });

    await test.step('Fill in correct delivery details', async () => {
        await fillDeliveryForm(checkoutPage, testContext);
    });

    await test.step('Ensure Invalid discount code keeps total unchanged', async () => {
        await expectTotalUnchanged(checkoutPage, async () => {
            await checkoutPage.applyDiscount('TESTCODE');
            await expect(checkoutPage.discountError).toBeVisible();
            await expect(checkoutPage.discountError).toHaveText(errorMessage.discountCodeInvalid);
        });
        await expect(checkoutPage.applyDiscountButton).toBeEnabled();
    });

    await test.step('Already used discount code is rejected and total stays the same', async () => {
        await expectTotalUnchanged(checkoutPage, async () => {
            await checkoutPage.applyDiscount(testContext.discountDetails.discountCode);
            await expect(checkoutPage.applyDiscountButton).toBeDisabled();

            await checkoutPage.fillDiscountCode(testContext.discountDetails.discountCode);
            await checkoutPage.removeDiscount();

            await expect(checkoutPage.discountError).toBeVisible();
            await expect(checkoutPage.discountError).toHaveText(errorMessage.discountCodeAlreadyUsed);
        });
    });

    await test.step('Place order', async () => {
        await placeOrderAndConfirm(checkoutPage);
    });
});

async function fillDeliveryForm(checkoutPage: CheckoutPage, testContext: TestContext) {
    await checkoutPage.fillContactEmail(checkoutTestData.email);

    const parcelBoxOptions = await checkoutPage.getParcelBoxOptions(checkoutTestData.shippingMethod);
    testContext.parcelBoxToSelect = parcelBoxOptions[0];

    await checkoutPage.fillDeliveryDetails({
        fullName: checkoutTestData.fullName,
        shippingDestination: checkoutTestData.shippingDestination,
        postalCode: checkoutTestData.postalCode,
        phoneCountry: checkoutTestData.phoneCountryCode,
        phone: checkoutTestData.phone,
        specialRequests: checkoutTestData.specialRequests,
        shippingMethod: checkoutTestData.shippingMethod,
        parcelBox: testContext.parcelBoxToSelect
    });
}

async function expectTotalUnchanged(checkoutPage: CheckoutPage, action: () => Promise<void>) {
    const totalBefore = MoneyUtils.toNumber(await checkoutPage.getTotalAmount());
    await action();
    await expect(async () => {
        const totalAfter = MoneyUtils.toNumber(await checkoutPage.getTotalAmount());
        expect(totalAfter).toBe(totalBefore);
    }).toPass();
}

async function placeOrderAndConfirm(checkoutPage: CheckoutPage) {
    await checkoutPage.placeOrder();
    await expect(checkoutPage.confirmationMessage).toBeVisible();
}

async function validateField(
    checkoutPage: CheckoutPage,
    input: Locator,
    values: readonly string[],
    error: string,
    clearAfter = false
) {
    for (const value of values) {
        await ensureAttributeIsValidated(checkoutPage, input, value, error);
        if (clearAfter) await checkoutPage.clearPhoneInput();
    }
}
