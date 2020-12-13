const puppeteer = require("puppeteer");

async function startBrowser(headless = true) {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
      headless,
      args: ["--disable-setuid-sandbox"],
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
