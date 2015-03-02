var app = require('express')();
var port = process.env.PORT || 3040;
var pg = require('pg');
var conString = process.env.DATABASE_URL;
var moment = require('moment')


pg.connect(conString, function(err, client, done) {
  console.log(conString);
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  setupRoutes(client, done);
});


function setupRoutes (client, done) {
  app.get('/stat', function (req, res) {
    runQuery(client, done, "SELECT max(brewed_at) from freshpots; SELECT count(*) FROM freshpots where brewed_at >= now()::date + interval '1h'; SELECT count(*) FROM freshpots;", function(err, result) {
      if (err) {
        sendError(err, res)
      } else {
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
    runQuery(client, done, 'INSERT INTO freshpots values (now());', function(err, result) {
      if (err) {
        sendError(err, res)
      } else {
        res.json(result)
      }
    });
  });

  app.listen(port, function() {
    console.log("Listening on port %s", port);
  });
}

function runQuery (client, done, query, cb) {
  client.query(query, function(err, result) {
    done();
    cb(err, result);
  });
}

function sendError (err, res) {
  console.log(err);
  res.send(err);
}
