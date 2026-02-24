const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Go to Home
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Click scan
    await page.click('a[href="/scan"]');
    await new Promise(r => setTimeout(r, 1000));

    let html = await page.content();
    console.log("FROM CLICK - RENDERED SCAN?", html.includes("Scan Your Food Label"));

    // Direct Navigation
    await page.goto('http://localhost:4173/scan', { waitUntil: 'networkidle0' });
    html = await page.content();
    console.log("FROM DIRECT - RENDERED SCAN?", html.includes("Scan Your Food Label"));

    await browser.close();
})();
