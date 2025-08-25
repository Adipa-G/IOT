import { test, expect } from '@playwright/test';

test('First config displayed', async ({ page }) => {
  await page.goto('/#/pin-config');

  await expect(page.getByTestId('pin-number-input').first()).toBeVisible();
  await expect(page.getByTestId('pin-number-input').first()).toHaveValue('2');
  await expect(page.getByTestId('pin-title-input').first()).toHaveValue('pin 2');
});

test('Second config displayed', async ({ page }) => {
  await page.goto('/#/pin-config');

  await expect(page.getByTestId('pin-number-input').nth(1)).toBeVisible();
  await expect(page.getByTestId('pin-number-input').nth(1)).toHaveValue('3');
  await expect(page.getByTestId('pin-title-input').nth(1)).toHaveValue('pin 3');
});

test('Add new config', async ({ page }) => {
  await page.goto('/#/pin-config');
  await expect(page.getByTestId('add-button')).toBeVisible();

  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('pin-number-input').nth(2)).toBeVisible();
  await expect(page.getByTestId('pin-number-input').nth(2)).toHaveValue('0');
  await expect(page.getByTestId('pin-title-input').nth(2)).toHaveValue('new 2');
});

test('Delete config', async ({ page }) => {
  await page.goto('/#/pin-config');
  await expect(page.getByTestId('remove-button').nth(1)).toBeVisible();

  await page.getByTestId('remove-button').nth(1).click();

  await expect(page.getByTestId('pin-number-input').nth(1)).not.toBeVisible();
});

test('Save', async ({ page }) => {
  await page.goto('/#/pin-config');

  await expect(page.getByTestId('save-button')).toBeVisible();
  await page.getByTestId('save-button').click();
});

test('Save validation error', async ({ page }) => {
  await page.goto('/#/pin-config');

  await expect(page.getByTestId('add-button')).toBeVisible();
  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('save-button')).toBeVisible();
  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('pin-config-validation-error')).toBeVisible();
});