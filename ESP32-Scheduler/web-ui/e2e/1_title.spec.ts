import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  page.on('framenavigated', async () => {
    console.log('Navigation occurred:', await page.url());
  });

  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/React App/);
});
