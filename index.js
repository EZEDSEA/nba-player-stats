const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 4000;

const cheerio = require("cheerio");
const fetch = require("node-fetch");

const URL =
  process.env.URL || "https://yasports.dbpn.com/history_v3.aspx/GetHistoryHTML";

class HTTPResponseError extends Error {
  constructor(response, ...args) {
    this.response = response;
    super(`HTTP Error Response: ${res.status} ${res.statusText}`, ...args);
  }
}

const checkStatus = (response) => {
  if (response.ok) {
    return response;
  } else {
    throw new HTTPResponseError(response);
  }
};

// app.use(cors());
const whitelist = process.env.WHITELIST || ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) === -1) {
        var message =
          "The CORS policy for this origin doesn't allow access from the particular origin.";
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/acr", async (req, res) => {
  const { query } = req;

  const { token = "" } = query;
  let { weeks = 0 } = query;
  let pData = [];

  while (weeks > 0) {
    const body = {
      dataJson: {
        WeeksBack: weeks,
        //   Product: "ALL",
        //   Sport: "ALL",
        //   WagerType: "-1",
        //   Result: "ALL",
      },
    };
    const response = await fetch(URL, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ["Cookie"]: `ASP_NET_SessionId=${token}`,
      },
    });

    try {
      checkStatus(response);

      const data = await response.json();
      const $ = cheerio.load(data.d);

      try {
        const tickets = $(".ticket").each((ind, elem) => {
          const transType = $(elem).find(".name-ticket").text();

          const balanceNodes = $(elem).find(".col-sm-2").first();

          const result = balanceNodes.text();
          const balance = balanceNodes.next().text();

          const riskTicket = $(elem).find(".rw-ticket > strong").text();
          const toRisk = riskTicket
            ? riskTicket.split("-")[0].split(":")[1].trim()
            : "";
          const toWin = riskTicket
            ? riskTicket.split("-")[1].split(":")[1].trim()
            : "";

          /*
            MU - Saints vrs Tricked: Saints To Win 10 Rds (Map 3) [95092] No +292 (Yes vrs No)N/A CANCEL
            Score: Yes() - No()
            Game start 02/22/2021 03:00 AM
            */

          /*
            MU - [92592] No +239 (Yes vrs No)LOSE
            Score: Yes(1) - No(0)
            Game start 02/15/2021 03:07 AM
            */

          // String is being split on the following:
          // 'MU - [96393] No Bounty Hunter +185 (No Bounty Hunter vrs NoUndying)WINScore: No Bounty Hunter(2) - NoUndying(0)Game start 02/01/2021 07:34 AM',
          const betTicket = $(elem).find(".pick-ticket").text();
          let betOdds = "";
          let betDetails = "";
          let betPlaced = "";
          let betResult = "";
          let betGameResult = "";
          let betDate = "";

          if (betTicket) {
            const ticket = betTicket.split("Game start");
            const betResults = ticket[0].split("Score:");

            const betGameDet = betResults[0].split(/\[.+\]/);
            const betDet = betGameDet[1].split(")");

            // if (typeof betDet !== "string") {
            //   throw `A parsing error occurred with: \n ${betGameDet}`;
            // }

            const betGame = betDet[0].split("(");
            const betDetail = betGame[0];

            betDetails = betGameDet[0];
            betPlaced = betGame[0]
              .substr(0, betDetail.search(/[-+]\d/) - 1)
              .trim();
            betOdds = betGame[0]
              .substr(betDetail.search(/[-+]\d/), betDetail.length - 1)
              .trim();
            betResult = betDet[1].trim();
            betGameResult = betResults[1].trim();
            betDate = ticket[1].trim();
          }

          const infoTicket = $(elem).find(".info-ticket > small");
          const dateTimeBet = infoTicket.first().text().trim();
          const ticketRefNum =
            infoTicket.length > 1
              ? infoTicket.last().text().split("#")[1].trim()
              : "";

          pData.push({
            transType,
            result,
            balance,
            betTicket,
            betDetails,
            betPlaced,
            betOdds,
            betGameResult,
            betResult,
            betDate,
            toRisk,
            toWin,
            dateTimeBet,
            ticketRefNum,
          });
        });
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error("The requested site returned an error: ", e);
      const errorBody = await response.text();
      res.send(errorBody);
    }

    weeks--;
  }
  res.send(pData);
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
