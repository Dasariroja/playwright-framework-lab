import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Checkout Page Object
 * Handles the SauceDemo checkout flow
 * 
 * TODO: This page object is incomplete — some methods need implementation
 */
export class CheckoutPage extends BasePage {
    // Locators
    private readonly cartItems: Locator;
    private readonly checkoutButton: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly postalCodeInput: Locator;
    private readonly continueButton: Locator;
    private readonly continueShoppingBtn: Locator;
    private readonly finishButton: Locator;
    private readonly cancelButton: Locator;
    private readonly completeHeader: Locator;
    private readonly summaryTotal: Locator;
    private readonly removeButtons: Locator;
    private readonly itemPrices: Locator;
    private readonly itemName: Locator;
    private readonly errorMessage: Locator;
    private readonly taxLabel: Locator;

    constructor(page: Page) {
        super(page, '/cart.html');

        this.cartItems = page.locator('.cart_item');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.continueShoppingBtn = page.locator('[data-test="continue-shopping"]');
        this.finishButton = page.locator('[data-test="finish"]');
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.completeHeader = page.locator('.complete-header');
        this.summaryTotal = page.locator('[data-test="total-label"]');
        this.removeButtons = page.locator('button[id*="remove"]');
        this.itemPrices = page.locator('.inventory_item_price');
        this.itemName = this.page.locator('.inventory_item_name');
        this.errorMessage = this.page.locator('[data-test="error"]');
        this.finishButton = page.getByRole('button', { name: 'Finish' });
        this.taxLabel = page.locator('.summary_tax_label');
        this.summaryTotal = page.locator('[data-test="total-label"]');
    }

    /**
     * Get the number of items in the cart
     */
    async getCartItemCount(): Promise<number> {
        return this.cartItems.count();
    }

    /**
     * Click the checkout button
     */
    async clickCheckout(): Promise<void> {
        await this.clickWithRetry(this.checkoutButton);
    }

    /**
     * Fill in checkout information
     */
    async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
        await this.clearAndFill(this.firstNameInput, firstName);
        await this.clearAndFill(this.lastNameInput, lastName);
        await this.clearAndFill(this.postalCodeInput, postalCode);
    }

    /**
     * Click continue to proceed to overview
     */
    async clickContinue(): Promise<void> {
        await this.continueButton.click();
    }

    async clickContinueShoppingBtn(): Promise<void> {
        await this.continueShoppingBtn.click();
    }

    /**
     * Complete the purchase
     */
    async clickFinish(): Promise<void> {
        await this.page.waitForURL(/checkout-step-two.html/);
        await this.finishButton.click();
    }

    async getTax(): Promise<number> {
        const taxText = await this.taxLabel.textContent();
        return parseFloat(taxText?.replace('Tax: $', '') || '0');
    }
    async getTotal(): Promise<number> {
        const totalText = await this.summaryTotal.textContent();
        return parseFloat(totalText?.replace('Total: $', '') || '0');
    }
    /**
     * Cancel the checkout
     */
    async clickCancel(): Promise<void> {
        await this.cancelButton.waitFor({ state: 'visible' });
        await this.cancelButton.click();
    }

    /**
 * Check if order is complete
 */
    async isOrderComplete(): Promise<boolean> {
        return await this.completeHeader.isVisible();
    }

    /**
     * Get the order completion message
     */
    async getCompletionMessage(): Promise<string> {
        return (await this.completeHeader.textContent()) || '';
    }

    /**
     * Get the summary total price
     */
    async getSummaryTotal(): Promise<string> {
        return this.getTextContent(this.summaryTotal);
    }

    /**
     * Remove an item from the cart by index
     */
    async removeItem(index: number): Promise<void> {
        await this.removeButtons.nth(index).waitFor({ state: 'visible' });
        await this.removeButtons.nth(index).click();
    }
    /**
     * Get all item prices in cart
     */
    async getItemPrices(): Promise<number[]> {
        const pricesText = await this.itemPrices.allTextContents();

        return pricesText.map(price =>
            parseFloat(price.replace('$', ''))
        );
    }
    async getItemName(): Promise<string> {
        return (await this.itemName.first().textContent()) || '';
    }

    async getSuccessMessage(): Promise<string> {
        return (await this.completeHeader.textContent()) || '';
    }

    async getErrorMessage(): Promise<string> {
        return (await this.errorMessage.textContent()) || '';
    }

}
