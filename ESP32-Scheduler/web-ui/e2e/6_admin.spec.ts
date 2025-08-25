import { test, expect } from '@playwright/test';

test('reboot', async ({ page }) => {
  await page.goto('http://localhost:3000/#/admin');

  await expect(page.getByTestId('reboot-button')).toBeVisible();
  await page.getByTestId('reboot-button').click();
  
  await expect(page.getByTestId('admin-loading-state')).toBeVisible();
});