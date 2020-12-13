const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const url = "https://ca.sports.yahoo.com/nba/players/5185/gamelog";

puppeteer
  .launch()
  .then((browser) => browser.newPage())
  .then((page) => {
    return page.goto(url).then(function () {
      return page.content();
    });
  })
  .then((html) => {
    const $ = cheerio.load(html);
    const stats = [];
    console.log(html);
    // $('a[href*="/r/news/comments"] > h2').each(function () {
    //   newsHeadlines.push({
    //     title: $(this).text(),
    //   });
    // });

    console.log(newsHeadlines);
  })
  .catch(console.error);
