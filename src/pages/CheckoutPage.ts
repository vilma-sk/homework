import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ComboBox } from './controls/Combobox';

export class CheckoutPage extends BasePage {

    readonly checkoutForm: Locator;
    readonly checkoutSummary: Locator;

    // Section headings
    readonly contactSectionTitle: Locator;
    readonly deliverySectionTitle: Locator;
    readonly shippingMethodSectionTitle: Locator;
    readonly paymentSectionTitle: Locator;

    // Contact
    readonly emailInput: Locator;

    // Delivery
    readonly fullNameInput: Locator;
    readonly shippingDestinationSelect: Locator;
    readonly postalCodeInput: Locator;
    readonly phoneCountryInput: Locator;
    readonly phoneInput: Locator;
    readonly specialRequestsInput: Locator;

    // Shipping method
    readonly shippingMethodOptions: Locator;
    readonly parcelBoxForSelectedShippingMethod: Locator;

    // Payment
    readonly bankTransferOption: Locator;

    // Submit
    readonly placeOrderButton: Locator;

    // Confirmation
    readonly confirmationMessage: Locator;

    // Checkout summary
    readonly discountInput: Locator;
    readonly applyDiscountButton: Locator;
    readonly discountError: Locator;
    readonly discountChip: Locator;
    readonly subtotalAmount: Locator;
    readonly discountAmount: Locator;
    readonly shippingAmount: Locator;
    readonly totalAmount: Locator;

    constructor(page: Page) {
        super(page);

        this.checkoutForm = page.locator('.checkout-page__content-form');
        this.checkoutSummary = page.locator('.checkout-page__content-summary');

        this.contactSectionTitle = this.checkoutForm.locator('.contact-information .section-title');
        this.deliverySectionTitle = this.checkoutForm.locator('.delivery-section .section-title');
        this.shippingMethodSectionTitle = this.checkoutForm.locator('.shipping-method .section-title');
        this.paymentSectionTitle = this.checkoutForm.locator('.payment-section .section-title');
        this.emailInput = this.checkoutForm.getByTestId('checkout-contactinformation-email-input').getByRole('textbox');
        this.fullNameInput = this.checkoutForm.getByTestId('checkout-contactinformation-name').getByRole('textbox');
        this.shippingDestinationSelect = this.checkoutForm.getByTestId('checkout-shippingdestination-select').getByRole('combobox');
        this.postalCodeInput = this.checkoutForm.getByTestId('checkout-contactinformation-postalcode').getByRole('textbox');
        this.phoneCountryInput = this.checkoutForm.getByTestId('checkout-contactinformation-phone').getByRole('button');
        this.phoneInput = this.checkoutForm.getByTestId('checkout-contactinformation-phone').getByRole('textbox');
        this.specialRequestsInput = this.checkoutForm.getByTestId('checkout-contactinformation-customfield').getByRole('textbox');

        this.shippingMethodOptions = this.checkoutForm.locator('input[name="shipping-options"]');
        this.parcelBoxForSelectedShippingMethod = this.checkoutForm.getByTestId('checkout-shippingoptions-parcelselect').getByRole('combobox').first();

        this.bankTransferOption = this.checkoutForm.getByTestId('checkout-paymentmethods-manual');
        this.placeOrderButton = this.checkoutForm.getByRole('button', { name: 'Place an order' });
        this.confirmationMessage = this.page.getByRole('heading', { name: 'Thank you for your order' });

        this.discountInput = this.checkoutSummary.getByTestId('checkout-cartsummary-input-discountcode').locator('input');
        this.applyDiscountButton = this.checkoutSummary.getByTestId('checkout-cartsummary-button-discountapply');
        this.discountError = this.checkoutSummary.locator('#discountCode-helper').first();
        this.discountChip = this.checkoutSummary.getByTestId('checkout-cartsummary-discount-pill');
        this.subtotalAmount = this.checkoutSummary.getByTestId('checkout-cartsummary-subtotalprice-value');
        this.discountAmount = this.checkoutSummary.getByTestId('checkout-cartsummary-discount-value');
        this.shippingAmount = this.checkoutSummary.getByTestId('checkout-cartsummary-shippingprice-value');
        this.totalAmount = this.checkoutSummary.getByTestId('checkout-cartsummary-totalprice-value');
    }

    async fillContactEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }

    async getShippingDestinationOptions(): Promise<string[]> {
        const comboBox = new ComboBox(this.page, this.shippingDestinationSelect);
        await comboBox.open();
        const options = await comboBox.getOptions();
        return options;
    }

    async selectDestinationCountryByName(name: string): Promise<void> {
        const comboBox = new ComboBox(this.page, this.shippingDestinationSelect);
        await comboBox.selectByName(name);
    }

    getShippingMethod(name: string): Locator {
        return this.shippingMethodOptions
            .filter({
                has: this.page
                    .locator('xpath=ancestor::*[.//input[@name="shipping-options"]][1]')
                    .filter({ hasText: name })
            })
            .first();
    }

    async selectShippingMethod(name: string): Promise<void> {
        const option = this.getShippingMethod(name);
        await option.check();
    }

    getParcelBoxSelect(shippingName: string): Locator {
        return this.getShippingMethod(shippingName)
            .locator('xpath=ancestor::*[.//input[@name="shipping-options"]][1]')
            .getByTestId('checkout-shippingoptions-parcelselect')
            .getByRole('combobox')
            .first();
    }

    async selectParcelBoxByName(parcelBoxName: string, shippingName: string): Promise<void> {
        const combo = new ComboBox(this.page, this.getParcelBoxSelect(shippingName));
        await combo.selectByName(parcelBoxName);
    }

    async getParcelBoxOptions(shippingName: string): Promise<string[]> {
        await this.selectShippingMethod(shippingName);
        const comboBox = new ComboBox(this.page, this.getParcelBoxSelect(shippingName));
        return await comboBox.getOptions();
    }

    async getSelectedParcelBoxOption(shippingName: string): Promise<string> {
        const comboBox = new ComboBox(this.page, this.getParcelBoxSelect(shippingName));
        return await comboBox.getSelectedText();
    }

    async getSelectedPhoneCountryCode(): Promise<string> {
        const comboBox = new ComboBox(this.page, this.phoneCountryInput, { phoneMode: true });

        return await comboBox.getSelectedText();
    }

    async selectPhoneCountry(countryCode: string): Promise<void> {
        const comboBox = new ComboBox(this.page, this.phoneCountryInput, { phoneMode: true });
        await comboBox.selectByName(countryCode);
    }

    async getBankTransferFullText(): Promise<string> {
        const paymentCardContent = this.bankTransferOption
            .locator('xpath=ancestor::*[contains(@class, "radio-group-card__item-content")][1]');

        await expect(paymentCardContent).toBeVisible();
        return (await paymentCardContent.innerText()).trim();
    }

    async getErrorMessage(input: Locator): Promise<string> {
        const wrapper = input.locator('xpath=ancestor::*[@data-qa][1]');
        const alert = wrapper.locator('span[role="alert"]').first();
        if (await alert.count() === 0) return '';
        return (await alert.textContent())?.trim() ?? '';
    }

    async clearPhoneInput(): Promise<void> {
        await this.phoneInput.fill('');
    }

    async fillDeliveryDetails(details: {
        fullName?: string; postalCode?: string;
        shippingDestination?: string;
        phoneCountry?: string;
        phone?: string; specialRequests?: string,
        shippingMethod: string, parcelBox?: string
    }): Promise<void> {
        if (details.fullName) await this.fullNameInput.fill(details.fullName);
        if (details.postalCode) await this.postalCodeInput.fill(details.postalCode);
        if (details.shippingDestination) await this.selectDestinationCountryByName(details.shippingDestination);
        if (details.phoneCountry) await this.selectPhoneCountry(details.phoneCountry);
        if (details.phone) await this.phoneInput.fill(details.phone);
        if (details.specialRequests) await this.specialRequestsInput.fill(details.specialRequests);
        await this.selectShippingMethod(details.shippingMethod);
        if (details.parcelBox) await this.selectParcelBoxByName(details.parcelBox, details.shippingMethod);
    }

    async placeOrder(): Promise<void> {
        await this.placeOrderButton.scrollIntoViewIfNeeded();
        await expect(this.placeOrderButton).toBeEnabled();
        await expect(async () => {
            await this.placeOrderButton.click();
            await this.page.waitForURL(/open-modal=EcommerceCheckoutSuccess/, { timeout: 5000 });
        }).toPass({ timeout: 30000 });
    }

    async triggerValidation(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        await expect(this.placeOrderButton).toBeEnabled();

        await this.placeOrderButton.click({ force: true });
    }

    async applyDiscount(code: string): Promise<void> {
        await this.fillDiscountCode(code);

        await expect(async () => {
            await this.applyDiscountButton.click();
            await expect(this.discountChip.or(this.discountError)).toBeVisible({ timeout: 2000 });
        }).toPass({ timeout: 10000 });
    }

    async fillDiscountCode(code: string): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        if (await this.discountInput.inputValue() !== '') {
            await this.discountInput.clear();
        }

        await expect(this.discountInput).toBeEnabled({ timeout: 5000 });
        await this.discountInput.fill(code);
        await this.blur();
    }

    async getSubtotal(): Promise<string> {
        return (await this.subtotalAmount.innerText()).trim();
    }

    async getDiscountAmount(): Promise<string> {
        return (await this.discountAmount.innerText()).trim();
    }

    async getShippingAmount(): Promise<string> {
        return (await this.shippingAmount.innerText()).trim();
    }

    async getTotalAmount(): Promise<string> {
        return (await this.totalAmount.innerText()).trim();
    }

    async removeDiscount(): Promise<void> {
        await expect(async () => {
            await this.discountChip.scrollIntoViewIfNeeded();
            await expect(this.discountChip).toBeVisible();

            await this.discountChip.hover();
            const removeIcon = this.discountChip.locator('.h-chip--dismissable');
            await removeIcon.scrollIntoViewIfNeeded();
            await removeIcon.click({ force: true });

            await expect(this.discountChip).toBeHidden({ timeout: 3000 });
        }).toPass({ timeout: 15000 });
    }

    async blur(): Promise<void> {
        await this.page.click('body');
    }

}
