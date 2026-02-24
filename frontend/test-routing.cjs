const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    console.log("Navigating to http://localhost:5173/");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    console.log("Waiting for scan link...");
    await page.waitForSelector('a[href="/scan"]');

    console.log("Clicking scan link...");
    await page.click('a[href="/scan"]');

    console.log("Waiting 3 seconds...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("Current URL:", page.url());

    await browser.close();
})();
