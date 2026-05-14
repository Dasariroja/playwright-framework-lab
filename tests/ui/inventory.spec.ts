import { test } from "@playwright/test";
import { SauceDemoPage } from "../pages/saucedemo.page";

test('Basic SauceDemo Sort scenario test', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await page.goto('/inventory.html');
    await sauceDemoPage.waitForInventoryPage();
    const productCount = await sauceDemoPage.getProductItems();
    console.log(`Number of products: ${productCount}`);
    await sauceDemoPage.sortProductsHighToLow();
    await sauceDemoPage.addFirstProductToCart();
    await sauceDemoPage.addSecondProductToCart();
    await sauceDemoPage.addLastProductToCart();
});

