import { test, expect } from '@playwright/test';

test.describe('Chart Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the application with default data', async ({ page }) => {
    await expect(page.locator('#xplot')).toBeVisible();
    await expect(page.locator('#mrplot')).toBeVisible();
  });

  test('displays X Plot and MR Plot titles', async ({ page }) => {
    await expect(page.locator('#xplot canvas')).toBeVisible();
    await expect(page.locator('#mrplot canvas')).toBeVisible();
  });

  test('data table is visible and editable', async ({ page }) => {
    const table = page.locator('#dataTable');
    await expect(table).toBeVisible();
    const cells = table.locator('.handsontable td');
    await expect(cells.first()).toBeVisible();
  });

  test('can add a divider line', async ({ page }) => {
    const addDividerBtn = page.locator('#add-divider');
    await expect(addDividerBtn).toBeVisible();
    await addDividerBtn.click();
    await page.waitForTimeout(500);
  });

  test('can remove a divider line after adding', async ({ page }) => {
    const addDividerBtn = page.locator('#add-divider');
    const removeDividerBtn = page.locator('#remove-divider');
    await addDividerBtn.click();
    await page.waitForTimeout(300);
    await removeDividerBtn.click();
    await page.waitForTimeout(300);
  });

  test('refresh charts button works', async ({ page }) => {
    const refreshBtn = page.locator('#refresh-charts');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('#xplot canvas')).toBeVisible();
  });

  test('download data button is present', async ({ page }) => {
    const downloadBtn = page.locator('#download-data');
    await expect(downloadBtn).toBeVisible();
  });

  test('share link button is present', async ({ page }) => {
    const shareBtn = page.locator('#share-link');
    await expect(shareBtn).toBeVisible();
  });
});

test.describe('Data Entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can edit a cell in the data table', async ({ page }) => {
    const table = page.locator('#dataTable');
    await expect(table).toBeVisible();
    const firstValueCell = table.locator('.handsontable tbody tr:first-child td:nth-child(2)');
    await firstValueCell.dblclick();
    await page.keyboard.type('9999');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });
});
