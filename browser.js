const puppeteer = require("puppeteer");

async function startBrowser(headless = true) {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
      headless,
      executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
      args: [
        // "--no-sandbox",
        "--disable-gpu",
      ],
      ignoreHTTPSErrors: true,
    });
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }
  return browser;
}

module.exports = {
  startBrowser,
};
