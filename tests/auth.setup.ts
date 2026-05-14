import { test as setup, expect } from '@playwright/test';
import { SauceDemoPage } from './pages/saucedemo.page';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as standard user', async ({ page }) => {
  const sauceDemoPage = new SauceDemoPage(page);

  await sauceDemoPage.navigateToSauceDemo();
  await sauceDemoPage.login(
    process.env.SAUCE_USERNAME || 'standard_user',
    process.env.SAUCE_PASSWORD || 'secret_sauce'
  );

  await expect(page).toHaveURL(/.*inventory.html/);
  expect(await sauceDemoPage.isLoggedIn()).toBe(true);

  await page.context().storageState({ path: authFile });
});