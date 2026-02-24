const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const logs = [];
    page.on('console', msg => {
        if (msg.text().includes('SCAN COMPONENT')) {
            console.log('BROWSER:', msg.text());
            logs.push(msg.text());
        }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    await page.click('nav a[href="/scan"]');
    await new Promise(r => setTimeout(r, 2000));

    if (!logs.includes('SCAN COMPONENT MOUNTED!')) {
        console.log('TEST RESULT: FAILED TO COMMIT. IT SUSPENDED OR ABORTED.');
    }

    await browser.close();
})();
