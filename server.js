// 1.15 Uses a big dark form to block a user from many accounts, redirects to form after, handles some invisible weird characters.

var helpers = require(__dirname + "/helpers.js"),
  Twit = require("twit");

/* Setting things up. */
var path = require("path"),
  express = require("express"),
  http = require("http"),
  app = express();

var bodyParser = require("body-parser");
// var multer = require('multer'); // v1.0.5
// var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static("public"));

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */

var errors = [],
  results = [],
  accounts = process.env.ACCOUNTS.split(",");

function block(conf, screenName, cb) {
  var T = new Twit(conf.twitter);
  T.post(
    "blocks/create",
    {
      screen_name: screenName,
      include_entities: false,
      skip_status: true
    },
    function(err, data, response) {
      cb(err, data, response);
    }
  );
}
var endpoint = `/${process.env.BOT_ENDPOINT}`;

function webPageText(status) {
  var html =
    "<style>" +
    "* { color: #BBB; background-color: rgb(25, 26, 30); }  " +
    "input,button { background-color: rgb(30, 32, 34); padding: 60px; } " +
    "form { text-align: center; margin-top: 250px; } " +
    "input,button,div { font-size: 70px; margin-top: 100px; } " +
    "button { padding: 60px 120px 60px 120px; } " +
    "div { text-align: center; } " +
    "</style>" +
    '<form action="' +
    endpoint +
    '" method="post">' +
    '<input type="text" name="blockthis" autofocus autocomplete="off" placeholder="@deplorablejerk"/><br/>' +
    '<button type="submit">Superblock</button></form><br/><div>' +
    status +
    "</div>";

  return html;
}

app.get(endpoint, function(req, res) {
  var blocked = req.query.blocked;
  var msg = blocked ? "blocked: " + blocked : "";
  res.send(webPageText(msg));
});

app.post(endpoint, function(req, res) {
  /* See EXAMPLES.js for some example code you can use. */

  var i,
    account,
    nextConfig,
    continueExec,
    toBlock = req.body.blockthis.replace(/\u202c/g, "").trim(); // Weird invisible character 8236 sometimes needs to be removed;

  (errors = []), (results = []);

  continueExec = function() {
    console.log(
      "errors: " +
        errors.length +
        ", results: " +
        results.length +
        ", accounts: " +
        accounts.length
    );
    // If some accounts are still waiting to get done, keep waiting.
    if (errors.length + results.length < accounts.length) {
      setTimeout(continueExec, 1000);
      return;
    }

    // If we get here then all accounts are done, either with or without error.
    if (results.length >= accounts.length) {
      //res.send(webPageText(toBlock + " blocked."));
      res.redirect(endpoint + "?blocked=" + toBlock);
    } else {
      res.sendStatus(500);
    }
  };

  for (i = 0; i < accounts.length; i++) {
    account = accounts[i];

    nextConfig = {
      twitter: {
        username: account,
        consumer_key: process.env[account + "_CONSUMER_KEY"],
        consumer_secret: process.env[account + "_CONSUMER_SECRET"],
        access_token: process.env[account + "_ACCESS_TOKEN"],
        access_token_secret: process.env[account + "_ACCESS_TOKEN_SECRET"]
      }
    };

    block(nextConfig, toBlock, function(err, data, response) {
      if (err) {
        console.log(err);
        errors.push(err);
      } else {
        console.log("blocked " + toBlock);
        results.push(data);
      }
    });
    console.log(account + " attempting to block " + toBlock);
  }

  continueExec();
});

var listener = app.listen(process.env.PORT, function() {
  console.log("your bot is running on port " + listener.address().port);
});
