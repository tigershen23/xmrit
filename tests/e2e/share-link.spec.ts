import { test, expect } from '@playwright/test';

test.describe('Share Link', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('share link button copies link to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const shareBtn = page.locator('#share-link');
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();
    const copiedMsg = page.locator('#data-copied-msg');
    await expect(copiedMsg).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(shareBtn).toBeVisible();
  });

  test('share link contains data parameter', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const shareBtn = page.locator('#share-link');
    await shareBtn.click();
    await page.waitForTimeout(500);
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('#');
    expect(clipboardText).toContain('d=');
  });

  test('navigating to share link restores data', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const shareBtn = page.locator('#share-link');
    await shareBtn.click();
    await page.waitForTimeout(500);
    const shareLink = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareLink);
    await page.waitForTimeout(1000);
    await expect(page.locator('#xplot canvas')).toBeVisible();
    await expect(page.locator('#mrplot canvas')).toBeVisible();
  });
});

test.describe('URL Parameters', () => {
  test('loads data from URL hash parameters', async ({ page }) => {
    const testUrl = '/#d=SGVsbG8.AAAAQAAAAIAAAAAA&v=0';
    await page.goto(testUrl);
    await page.waitForTimeout(1000);
    await expect(page.locator('#xplot')).toBeVisible();
  });
});
