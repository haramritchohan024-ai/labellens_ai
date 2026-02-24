const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const logs = [];
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        logs.push(msg.text());
        console.log('BROWSER:', msg.text());
    });
    page.on('pageerror', err => logs.push('ERROR: ' + err.message));

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    logs.push("--- CLICKING SCAN ---");
    await page.click('nav a[href="/scan"]');
    await new Promise(r => setTimeout(r, 2000));

    fs.writeFileSync('logs11.txt', logs.join('\n'));
    await browser.close();
})();
