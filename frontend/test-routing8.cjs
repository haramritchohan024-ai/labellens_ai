const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('REACT ERROR:', msg.text());
        }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // click scan
    await page.click('a[href="/scan"]');
    await new Promise(r => setTimeout(r, 2000));

    // also try history
    await page.click('a[href="/history"]');
    await new Promise(r => setTimeout(r, 2000));

    await browser.close();
})();
