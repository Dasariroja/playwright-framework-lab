import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../pages/saucedemo.page';
import { customerDetails } from '../../test-data';

test.describe('SauceDemo E-commerce Tests @ui', () => {
  let sauceDemoPage: SauceDemoPage;

  test.beforeEach(async ({ page }) => {
    sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.navigateToSauceDemo();
  });

  test('should login successfully with valid credentials @smoke @regression', async () => {
    // Verify we're on login page
    expect(await sauceDemoPage.isOnLoginPage()).toBe(true);

    // Perform login
    await sauceDemoPage.login(customerDetails.username, customerDetails.password);

    // Verify successful login
    expect(await sauceDemoPage.isLoggedIn()).toBe(true);
    expect(await sauceDemoPage.isOnInventoryPage()).toBe(true);

    // Verify we can see products
    const productCount = await sauceDemoPage.getProductItems();
    expect(productCount).toBeGreaterThan(0);

    // Take screenshot for documentation
    await sauceDemoPage.takeScreenshot('saucedemo-inventory-page');
  });

  test('should display product inventory and add items to cart @regression', async () => {
    await sauceDemoPage.login(customerDetails.username, customerDetails.password);

    // Verify inventory page is loaded
    await sauceDemoPage.waitForInventoryPage();

    // Get product information
    const productNames = await sauceDemoPage.getProductNames();
    expect(productNames.length).toBeGreaterThan(0);

    // Verify specific products are available
    const expectedProducts = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
    const hasExpectedProducts = expectedProducts.some(product =>
      productNames.some((name: string) => name.includes(product.split(' ')[2])) // Check for key words
    );
    expect(hasExpectedProducts).toBe(true);

    // Add first product to cart
    await sauceDemoPage.addFirstProductToCart();

    // Verify cart badge appears with count
    expect(await sauceDemoPage.isCartBadgeVisible()).toBe(true);
    const cartCount = await sauceDemoPage.getCartItemCount();
    expect(cartCount).toBe(1);

    // Add another product
    await sauceDemoPage.addProductsToCart(2); // This will add 2 more items

    // Verify cart count increased
    const updatedCartCount = await sauceDemoPage.getCartItemCount();
    expect(updatedCartCount).toBe(3); // 1 + 2 = 3 items

    // Take screenshot of cart with items
    await sauceDemoPage.takeScreenshot('saucedemo-cart-with-items');
  });

  test('should handle invalid login credentials gracefully @negative @regression', async () => {
    // Test data - invalid credentials
    const invalidUsername = 'invalid_user';
    const invalidPassword = 'wrong_password';

    // Verify we're on login page
    expect(await sauceDemoPage.isOnLoginPage()).toBe(true);

    // Attempt login with invalid credentials
    await sauceDemoPage.login(invalidUsername, invalidPassword);

    // Verify we're still on login page (login failed)
    expect(await sauceDemoPage.isOnLoginPage()).toBe(true);
    expect(await sauceDemoPage.isLoggedIn()).toBe(false);

    // Verify error message is displayed
    const errorMessage = await sauceDemoPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Username and password do not match');

    // Test with locked out user
    const lockedUsername = 'locked_out_user';
    const validPassword = 'secret_sauce';

    await sauceDemoPage.login(lockedUsername, validPassword);

    // Verify locked out error message
    const lockedErrorMessage = await sauceDemoPage.getErrorMessage();
    expect(lockedErrorMessage).toBeTruthy();
    expect(lockedErrorMessage).toContain('locked out');

    // Take screenshot of error state
    await sauceDemoPage.takeScreenshot('saucedemo-login-error');
  });
});