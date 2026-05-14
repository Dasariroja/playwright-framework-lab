import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../pages/saucedemo.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CHECKOUT_URL, INVENTORY_URL } from '../../test-settings';
import { customerDetails } from '../../test-data';

test.describe('SauceDemo Checkout Tests @ui', () => {
    let sauceDemoPage: SauceDemoPage;
    let checkoutPage: CheckoutPage;

    test.beforeEach(async ({ page }) => {
        sauceDemoPage = new SauceDemoPage(page);
        checkoutPage = new CheckoutPage(page);

        await page.goto(INVENTORY_URL);
        await sauceDemoPage.waitForInventoryPage();
    });

    test('should complete full checkout flow @smoke @regression', async ({ page }) => {

        // Add product
        await sauceDemoPage.addFirstProductToCart();
        expect(await sauceDemoPage.getCartItemCount()).toBe(1);

        // Go to cart
        await sauceDemoPage.clickCart();

        // Validate cart
        expect(await checkoutPage.getCartItemCount()).toBe(1);

        // Checkout
        await checkoutPage.clickCheckout();

        // Fill details
        await checkoutPage.fillCheckoutInfo('John', 'Doe', 'SW1A 1AA');
        await checkoutPage.clickContinue();

        // Verify overview page
        await expect(page).toHaveURL(/checkout-step-two.html/);

        // Verify item present
        const itemName = await checkoutPage.getItemName();
        expect(itemName).toBeTruthy();

        // Finish order
        await checkoutPage.clickFinish();

        // ADD HERE (your missing part)
        await expect(page).toHaveURL(/checkout-complete.html/);

        expect(await checkoutPage.isOrderComplete()).toBeTruthy();

        const message = await checkoutPage.getCompletionMessage();
        expect(message).toContain('Thank you');
    });

    test('should show error when checkout info is missing @negative @regression', async ({ page }) => {
        await sauceDemoPage.addFirstProductToCart();
        await sauceDemoPage.clickCart();
        await checkoutPage.clickCheckout();
        await checkoutPage.clickContinue();
        const errorMessage = await checkoutPage.getErrorMessage();
        expect(errorMessage).toContain('Error');
        await expect(page).toHaveURL(/checkout-step-one.html/);
    });

    test('should calculate correct total for multiple items @regression', async ({ page }) => {
        await sauceDemoPage.addFirstProductToCart();
        await sauceDemoPage.addSecondProductToCart();
        await sauceDemoPage.clickCart();
        await checkoutPage.clickCheckout();
        await checkoutPage.fillCheckoutInfo('John', 'Doe', 'SW1A 1AA');
        await checkoutPage.clickContinue();
        await expect(page).toHaveURL(/checkout-step-two.html/);

        const itemPrices = await checkoutPage.getItemPrices();
        const itemsTotal = itemPrices.reduce((sum, price) => sum + price, 0);
        const tax = await checkoutPage.getTax();
        const displayedTotal = await checkoutPage.getTotal();
        expect(displayedTotal).toBeCloseTo(itemsTotal + tax, 2);
    });

    test('should allow removing items from cart before checkout @regression', async ({ page }) => {
        await sauceDemoPage.addFirstProductToCart();
        await sauceDemoPage.addSecondProductToCart();
        expect(await sauceDemoPage.getCartItemCount()).toBe(2);
        await sauceDemoPage.clickCart();

        await checkoutPage.removeItem(1);
        await expect(page.locator('.cart_item')).toHaveCount(1);
        await checkoutPage.clickCheckout();
        await checkoutPage.fillCheckoutInfo(customerDetails.firstName, customerDetails.lastName, customerDetails.postalCode);
        await checkoutPage.clickContinue();
        await expect(page).toHaveURL(/checkout-step-two.html/);
    });

    test('should cancel checkout and return to inventory @negative', async ({ page }) => {
        await sauceDemoPage.addFirstProductToCart();
        await sauceDemoPage.clickCart();

        await checkoutPage.clickCheckout();
        await checkoutPage.clickCancel();
        await expect(page).toHaveURL(CHECKOUT_URL);

        await checkoutPage.clickContinueShoppingBtn();
        await expect(page).toHaveURL(INVENTORY_URL);
    });
});