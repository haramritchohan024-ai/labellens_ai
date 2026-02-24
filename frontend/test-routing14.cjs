const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const logs = [];
    page.on('console', msg => {
        if (msg.text().includes('HISTORY COMPONENT')) {
            console.log('BROWSER:', msg.text());
            logs.push(msg.text());
        }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    console.log("Clicking history link...");
    await page.click('nav a[href="/history"]');
    await new Promise(r => setTimeout(r, 2000));

    if (!logs.includes('HISTORY COMPONENT MOUNTED!')) {
        console.log('TEST RESULT: HISTORY FAILED TO COMMIT.');
    } else {
        console.log('TEST RESULT: HISTORY MOUNTED!');
    }

    await browser.close();
})();
