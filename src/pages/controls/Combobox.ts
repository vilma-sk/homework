import { Locator, Page, expect } from '@playwright/test';

export class ComboBox {
    constructor(private page: Page, private root: Locator, private config?: { phoneMode?: boolean }) { }

    private get dialog() {
        return this.page.locator('.h-popover:visible, [role="listbox"]:visible').first();
    }

    private get options() {
        return this.dialog.locator('li[role="option"]');
    }

    private get searchInput() {
        if (this.config?.phoneMode) {
            return this.dialog.locator('.vti__search_box').first();
        }
        return this.dialog.locator('.h-input__field').first();
    }

    async open(): Promise<void> {
        await this.root.scrollIntoViewIfNeeded().catch(() => { });
        await this.root.click({ force: true });

        const dialog = this.dialog;
        await dialog.waitFor({ state: 'attached', timeout: 3000 });
        await expect(dialog).toBeVisible({ timeout: 3000 });
    }

    async selectByName(name: string): Promise<void> {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const currentText = (await this.root.innerText().catch(() => '')).trim();
        if (new RegExp(escapedName, 'i').test(currentText)) {
            return;
        }

        await this.open();

        const filteredOption = this.options.filter({ hasText: new RegExp(escapedName, 'i') }).first();

        const search = this.searchInput;
        if (await search.isVisible().catch(() => false)) {
            await search.fill(name);
            await expect(filteredOption).toBeVisible({ timeout: 5000 });
        }

        await filteredOption.click({ force: true });
    }

    async getOptions(): Promise<string[]> {
        await this.open();
        const texts = await this.options.allTextContents();
        await this.page.keyboard.press('Escape');
        return texts.map(t => t.trim()).filter(Boolean);
    }

    async getSelectedText(): Promise<string> {
        if (this.config?.phoneMode) {
            const flag = this.root.locator('.vti__flag').first();
            const classes = (await flag.getAttribute('class'))?.split(/\s+/) ?? [];
            const code = classes.find(c => c !== 'vti__flag');
            return code?.toLowerCase() ?? '';
        }

        return (await this.root.innerText()).trim();
    }
}
