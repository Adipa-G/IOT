import { test, expect } from '@playwright/test';

test('Memory displayed', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('dashboard-memory-widget')).toBeVisible();
  await expect(page.getByTestId('dashboard-memory-widget')).toContainText('53.21 kB');
});

test('Tempreature displayed', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('dashboard-tempreature-widget')).toBeVisible();
  await expect(page.getByTestId('dashboard-tempreature-widget')).toContainText('44.00 C');
});

test('Voltage displayed', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('dashboard-voltage-widget')).toBeVisible();
  await expect(page.getByTestId('dashboard-voltage-widget')).toContainText('3.78 V');
});

test('Time displayed', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('dashboard-time-widget')).toBeVisible();
  await expect(page.getByTestId('dashboard-time-widget')).toContainText('2025');
});

test('Pin 2 start time displayed', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('schedule-widget-pin-2').getByTestId('schedule-widget-start-and-end-time')).toBeVisible();
  await expect(page.getByTestId('schedule-widget-pin-2').getByTestId('schedule-widget-start-and-end-time')).toContainText('Schedule');
});

test('Pin 2 turn off', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('schedule-widget-pin-2').getByTestId('schedule-widget-off-button')).toBeVisible();
  
  await expect(page.getByTestId('schedule-widget-pin-2').getByTestId('schedule-widget-off-button')).toContainClass('btn btn-success');
  await page.getByTestId('schedule-widget-pin-2').getByTestId('schedule-widget-off-button').click();

  await page.waitForSelector('.btn-secondary', { state: 'visible' });
  await expect(page.getByTestId('schedule-widget-pin-2').getByTestId('schedule-widget-off-button')).toContainClass('btn-secondary');
});

test('Pin 3 start time displayed', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('schedule-widget-pin-3').getByTestId('schedule-widget-start-and-end-time')).toBeVisible();
  await expect(page.getByTestId('schedule-widget-pin-3').getByTestId('schedule-widget-start-and-end-time')).toContainText('Schedule');
});

test('Pin 3 turn off', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('schedule-widget-pin-3').getByTestId('schedule-widget-off-button')).toBeVisible();
  
  await expect(page.getByTestId('schedule-widget-pin-3').getByTestId('schedule-widget-off-button')).toContainClass('btn-success');
  await page.getByTestId('schedule-widget-pin-3').getByTestId('schedule-widget-off-button').click();

  await page.waitForSelector('.btn-secondary', { state: 'visible' });
  await expect(page.getByTestId('schedule-widget-pin-3').getByTestId('schedule-widget-off-button')).toContainClass('btn-secondary');
});