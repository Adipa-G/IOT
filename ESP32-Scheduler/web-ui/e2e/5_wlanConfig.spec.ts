import { test, expect } from '@playwright/test';

test('Validation erorr when saving', async ({ page }) => {
  await page.goto('/#/wlan-config');

  await expect(page.getByTestId('save-button')).toBeVisible();
  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('wlan-config-validation-error')).toBeVisible();
});

test('Save when no validation error', async ({ page }) => {
  await page.goto('/#/wlan-config');

  await expect(page.getByTestId('wlan-ssid')).toBeVisible();
  await page.getByTestId('wlan-ssid').fill('my-ssid');
  await page.getByTestId('wlan-password').fill('my-pwd');

  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('wlan-config-validation-error')).not.toBeVisible();
});



