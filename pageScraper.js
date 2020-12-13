async function scraper(browser, url) {
  let page = await browser.newPage();
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  await page.waitForSelector("table.graph-table");
  try {
    const cols = await page.$$eval("table.graph-table > thead", (rows) => {
      rows = rows.map((row) => {
        return [...row.lastChild.querySelectorAll("th")].map(
          (th) => th.innerText
        );
      });
      return rows;
    });

    const colNames = cols[0];

    const stats = await page.$$eval(
      "table.graph-table > tbody > tr",
      (rows) => {
        rows = rows.map((row) => {
          const rowData = [...row.querySelectorAll("td")].map(
            (data, ind) => data.innerText
          );
          return rowData;
        });
        return rows;
      }
    );

    // Aligns data with respective columns and serializes into proper types
    const playerStats = stats.map((row) =>
      row.reduce((acc, val, ind) => {
        let statVal = val;
        switch (colNames[ind]) {
          case "FGM":
          case "FGA":
          case "3PM":
          case "3PA":
          case "OR":
          case "DR":
          case "Reb":
          case "Ast":
          case "TO":
          case "Stl":
          case "Blk":
          case "PF":
          case "Pts":
          case "FTM":
          case "FTA":
            statVal = parseInt(val);
            break;
          case "FG%":
          case "3P%":
          case "FT%":
            statVal = parseFloat(val);
          case "Date":
            break;
        }

        return {
          ...acc,
          [colNames[ind]]: statVal,
        };
      }, {})
    );

    console.table(playerStats);
  } catch (err) {
    console.error(err);
  }
  await browser.close();
}

module.exports = scraper;
