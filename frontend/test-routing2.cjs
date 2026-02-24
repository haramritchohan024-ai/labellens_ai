const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const logs = [];
    page.on('console', msg => logs.push('BROWSER CONSOLE: ' + msg.type() + ' ' + msg.text()));
    page.on('pageerror', error => logs.push('BROWSER ERROR: ' + error.message));

    logs.push("Navigating to http://localhost:5173/");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    logs.push("Waiting for scan link...");
    await page.waitForSelector('a[href="/scan"]');

    logs.push("Clicking scan link...");
    await page.click('a[href="/scan"]');

    logs.push("Waiting 3 seconds...");
    await new Promise(r => setTimeout(r, 3000));

    logs.push("Current URL: " + page.url());

    fs.writeFileSync('puppeteer_logs.txt', logs.join('\n'));
    await browser.close();
})();
