import { test, expect } from '@playwright/test';

test('Show screen on seconds', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('screen-on-seconds')).toBeVisible();

  await expect(page.getByTestId('screen-on-seconds').first()).toHaveValue('300');
});

test('Show voltage sensor pin', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('voltage-sensor-pin')).toBeVisible();

  await expect(page.getByTestId('voltage-sensor-pin').first()).toHaveValue('31');
});

test('Show voltage mulitplier', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('voltage-multiplier')).toBeVisible();

  await expect(page.getByTestId('voltage-multiplier').first()).toHaveValue('1.33');
});

test('Show high power setup', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('high-power-min-voltage')).toBeVisible();

  await expect(page.getByTestId('high-power-min-voltage').first()).toHaveValue('4');
  await expect(page.getByTestId('high-power-cpu-freq').first()).toHaveValue('240');
});

test('Show medium power setup', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('med-power-min-voltage')).toBeVisible();

  await expect(page.getByTestId('med-power-min-voltage').first()).toHaveValue('3.2');
  await expect(page.getByTestId('med-power-cpu-freq').first()).toHaveValue('160');
});

test('Show low power setup', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('low-power-min-voltage')).toBeVisible();

  await expect(page.getByTestId('low-power-min-voltage').first()).toHaveValue('3');
  await expect(page.getByTestId('low-power-cpu-freq').first()).toHaveValue('80');
});

test('Extra low power sleep duration', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('ex-low-power-sleep-duration')).toBeVisible();

  await expect(page.getByTestId('ex-low-power-sleep-duration').first()).toHaveValue('8');
});

test('Can save', async ({ page }) => {
  await page.goto('/#/power-config');

  await expect(page.getByTestId('save-button')).toBeVisible();
  await page.getByTestId('save-button').click();
});