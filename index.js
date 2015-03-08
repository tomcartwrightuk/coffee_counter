var app = require('express')();
var port = process.env.PORT || 3040;
var pg = require('pg');
var conString = process.env.DATABASE_URL + '?ssl=true';
var moment = require('moment')

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('error fetching client from pool', err);
  } else {
    setupRoutes(client);
  }
});


function setupRoutes (client) {
  app.get('/stat', function (req, res) {
    runQuery(client, "SELECT max(brewed_at) from freshpots; SELECT count(*) FROM freshpots where brewed_at >= now()::date + interval '1h'; SELECT count(*) FROM freshpots;", function(err, result) {
      if (err) {
        sendError(err, res)
      } else {
        console.log("Result of stat %s \n", JSON.stringify(result));
        var mostRecent = result.rows[0].max;
        var displayMostRecent = moment(mostRecent).fromNow();
        res.json({
          mostRecent: displayMostRecent,
          today: result.rows[1].count,
          sinceBeginning: result.rows[2].count
        });
      }
    });
  });

  app.post('/freshpots', function (req, res) {
    runQuery(client, 'INSERT INTO freshpots values (now());', function(err, result) {
      if (err) {
        sendError(err, res)
      } else {
        console.log("Result of freshports %s \n", JSON.stringify(result));
        res.json(result)
      }
    });
  });

  app.listen(port, function() {
    console.log("Listening on port %s", port);
  });
}

function runQuery (client, query, cb) {
  client.query(query, function(err, result) {
    cb(err, result);
  });
}

function sendError (err, res) {
  console.log(err);
  res.send(err);
}
