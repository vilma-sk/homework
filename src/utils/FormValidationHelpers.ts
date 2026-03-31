import { expect, Locator } from '@playwright/test';

export interface ValidatablePage {
    triggerValidation(): Promise<void>;
    getErrorMessage(input: Locator): Promise<string>;
}

export async function assertInputDefaults(
    input: Locator,
    defaultValue: string,
    placeholder?: string
): Promise<void> {
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await expect(input).toHaveValue(defaultValue);

    if (placeholder) {
        await expect(input).toHaveAttribute('placeholder', placeholder);
    } else {
        await expect(input).not.toHaveAttribute('placeholder');
    }
}

export async function assertSelectDefaults(
    select: Locator,
    defaultValue: string
): Promise<void> {
    await expect(select).toBeVisible();
    await expect(select).toBeEnabled();
    await expect(select).toHaveText(defaultValue);
}

export async function ensureAttributeIsValidated(
    page: ValidatablePage,
    input: Locator,
    valueToSet: string,
    expectedValidation: string
): Promise<void> {
    await input.fill(valueToSet);

    await page.triggerValidation();

    await validateError(page, input, expectedValidation);
}

export async function validateError(page: ValidatablePage, input: Locator, expected: string) {
    await expect
        .poll(async () => page.getErrorMessage(input), { timeout: 10000 })
        .toBe(expected);
}
