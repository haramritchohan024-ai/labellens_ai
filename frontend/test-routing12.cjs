const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    console.log("Clicking scan...");
    await page.click('nav a[href="/scan"]');

    // Wait to allow React to process
    await new Promise(r => setTimeout(r, 2000));

    const mainHTML = await page.evaluate(() => document.querySelector('main').innerHTML);

    if (mainHTML.includes("Scan Your Food Label")) {
        console.log("SUCCESS: SCAN IS IN MAIN!");
    } else if (mainHTML.includes("Scan Labels.")) {
        console.log("FAILURE: LANDING IS STILL IN MAIN!");
    } else {
        console.log("UNKNOWN: MAIN IS SOMETHING ELSE!");
        console.log(mainHTML.substring(0, 200));
    }

    await browser.close();
})();
