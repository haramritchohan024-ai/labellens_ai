const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.click('a[href="/scan"]');
    await new Promise(r => setTimeout(r, 2000));

    const html = await page.content();
    fs.writeFileSync('scan_rendered.html', html);

    await browser.close();
})();
