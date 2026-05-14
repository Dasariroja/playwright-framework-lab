import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SauceDemoPage extends BasePage {
  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly inventoryContainer: Locator;
  private readonly productItems: Locator;
  private readonly cartButton: Locator;
  private readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly errorMessage: Locator;
  private readonly addToCartButtons: Locator;
  private readonly summaryTotal: Locator;
  private readonly finishButton: Locator;
  readonly productSortContainer: Locator;

  constructor(page: Page) {
    super(page, '/');

    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.productItems = page.locator('.inventory_item');
    this.cartButton = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.errorMessage = page.locator('[data-test="error"]');
    this.addToCartButtons = page.locator('button[id*="add-to-cart"]');
    this.summaryTotal = page.locator('[data-test="total-label"]');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.productSortContainer = page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Navigate to the SauceDemo homepage
   */
  async navigateToSauceDemo(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  /**
   * Login with the given credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.waitForElement(this.usernameInput);
    await this.clearAndFill(this.usernameInput, username);
    await this.clearAndFill(this.passwordInput, password);
    await this.clickWithRetry(this.loginButton);

    // Wait for either inventory page or error message
    await Promise.race([
      this.page.waitForURL('**/inventory.html', { timeout: 5000 }).catch(() => { }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
    ]);
  }

  /**
   * Check if user is logged in (inventory page visible)
   */
  async isLoggedIn(): Promise<boolean> {
    return this.isVisible(this.inventoryContainer);
  }

  /**
   * Get the number of product items on the page
   */
  async getProductItems(): Promise<number> {
    await this.waitForElement(this.productItems.first());
    return this.productItems.count();
  }

  /**
   * Get all product names
   */
  async getProductNames(): Promise<string[]> {
    await this.waitForElement(this.productItems.first());
    const names: string[] = [];
    const count = await this.productItems.count();

    for (let i = 0; i < count; i++) {
      const nameElement = this.productItems.nth(i).locator('.inventory_item_name');
      const name = await this.getTextContent(nameElement);
      if (name) {
        names.push(name);
      }
    }

    return names;
  }

  async sortProductsHighToLow(): Promise<void> {
    await this.productSortContainer.selectOption({ index: 3 }); // Select "Price (high to low)"
  }

  /**
   * Add the first product to cart
   */
  async addFirstProductToCart(): Promise<void> {
    await this.waitForElement(this.addToCartButtons.first());
    await this.clickWithRetry(this.addToCartButtons.first());
  }

  async addSecondProductToCart(): Promise<void> {
    await this.waitForElement(this.addToCartButtons.nth(1));
    await this.clickWithRetry(this.addToCartButtons.nth(1));
  }

  async addLastProductToCart(): Promise<void> {
    await this.waitForElement(this.addToCartButtons.last());
    await this.clickWithRetry(this.addToCartButtons.last());
  }

  /**
   * Add multiple products to cart
   */
  async addProductsToCart(count: number): Promise<void> {
    const availableButtons = await this.addToCartButtons.count();
    const itemsToAdd = Math.min(count, availableButtons);

    for (let i = 0; i < itemsToAdd; i++) {
      await this.addToCartButtons.nth(i).click();
    }
  }

  async addProductToCarts(index: number): Promise<void> {
    await this.waitForElement(this.addToCartButtons.nth(index));
    await this.clickWithRetry(this.addToCartButtons.nth(index));
  }
  /**
   * Get the cart item count from the badge
   */
  async getCartItemCount(): Promise<number> {
    if (await this.isVisible(this.cartBadge)) {
      const badgeText = await this.getTextContent(this.cartBadge);
      return parseInt(badgeText) || 0;
    }
    return 0;
  }

  /**
   * Click on the cart button
   */
  async clickCart(): Promise<void> {
    await this.clickWithRetry(this.cartButton);
    await this.waitForPageLoad();
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.clickWithRetry(this.menuButton);
    await this.waitForElement(this.logoutLink);
    await this.clickWithRetry(this.logoutLink);
    await this.waitForPageLoad();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isVisible(this.errorMessage)) {
      return this.getTextContent(this.errorMessage);
    }
    return '';
  }

  /**
   * Check if on the login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return this.isVisible(this.loginButton);
  }

  /**
   * Check if on the inventory page
   */
  async isOnInventoryPage(): Promise<boolean> {
    return this.isVisible(this.inventoryContainer);
  }

  /**
   * Check if the cart badge is visible
   */
  async isCartBadgeVisible(): Promise<boolean> {
    return this.isVisible(this.cartBadge);
  }

  /**
   * Wait for the inventory page to fully load
   */
  async waitForInventoryPage(): Promise<void> {
    await this.waitForElement(this.inventoryContainer);
  }

  /**
   * Get product price by index
   */
  async getProductPrice(index: number): Promise<string> {
    const priceElement = this.productItems.nth(index).locator('.inventory_item_price');
    return this.getTextContent(priceElement);
  }

  /**
   * Get product description by index
   */
  async getProductDescription(index: number): Promise<string> {
    const descElement = this.productItems.nth(index).locator('.inventory_item_desc');
    return this.getTextContent(descElement);
  }
}