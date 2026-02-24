const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log('BROWSER CONSOLE:', msg.type(), msg.text());
        }
    });
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    await page.goto('http://localhost:5173/scan', { waitUntil: 'networkidle0' });

    let html = await page.content();
    console.log("SCAN DIRECT LOAD RENDERED?", html.includes("Scan Your Food Label"));

    await page.goto('http://localhost:5173/history', { waitUntil: 'networkidle0' });
    html = await page.content();
    console.log("HISTORY DIRECT LOAD RENDERED?", html.includes("Scan History"));

    await browser.close();
})();
