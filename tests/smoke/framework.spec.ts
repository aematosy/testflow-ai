import { test, expect } from '@playwright/test';

test('TestFlow Playwright baseline is operational', async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>TestFlow</h1>
    </main>
  `);

  await expect(
    page.getByRole('heading', {
      name: 'TestFlow',
      exact: true,
    }),
  ).toBeVisible();
});
