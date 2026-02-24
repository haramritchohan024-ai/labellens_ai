const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    // Navigate programmatically by history push to simulate React Router Link click if it failed,
    // but let's actually just assign location.href and wait for React to boot up to see if the Route matches.
    await page.evaluate(() => { window.location.href = '/scan'; });
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const html = await page.content();
    console.log("RENDERED SCAN?", html.includes("Scan Your Food Label"));

    // also check what component is actually inside main
    const mainHTML = await page.evaluate(() => document.querySelector('main').innerHTML);
    console.log("MAIN HTML CONTAINS LANDING?", mainHTML.includes("Scan Labels."));

    await browser.close();
})();
