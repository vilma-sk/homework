const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto('https://lightgrey-antelope-m7vwozwl8xf7l3y2.builder-preview.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const matches = await page.evaluate(() => {
    const textNeedle = 'muffin';
    const all = Array.from(document.querySelectorAll('body *'));
    const found = [];
    for (const el of all) {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt) continue;
      const lower = txt.toLowerCase();
      if (lower.includes('10%') && lower.includes('code') && lower.includes(textNeedle)) {
        found.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: el.className || '',
          dataQa: el.getAttribute('data-qa') || '',
          dataTestId: el.getAttribute('data-testid') || '',
          role: el.getAttribute('role') || '',
          text: txt.slice(0, 220),
        });
      }
    }
    return found.slice(0, 20);
  });

  console.log(JSON.stringify(matches, null, 2));
  await browser.close();
})();
