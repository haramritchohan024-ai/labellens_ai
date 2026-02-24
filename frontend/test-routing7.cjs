const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));

    console.log("Loading Home");
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    console.log("Clicking scan Link...");
    // click navbar link
    await page.click('nav a[href="/scan"]');

    // Wait to let React render
    await new Promise(r => setTimeout(r, 2000));

    console.log("Taking screenshot");
    await page.screenshot({ path: 'screenshot.png' });

    const text = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('page_text.txt', text);

    await browser.close();
})();
