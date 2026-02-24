const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.click('a[href="/about"]');
    await new Promise(r => setTimeout(r, 1000));

    let html = await page.content();
    console.log("ABOUT RENDERED?", html.includes("About LabelLens AI"));

    await page.click('a[href="/scan"]');
    await new Promise(r => setTimeout(r, 1000));

    html = await page.content();
    console.log("SCAN RENDERED?", html.includes("Scan Your Food Label"));

    console.log("SCROLL Y:", await page.evaluate(() => window.scrollY));

    await browser.close();
})();
