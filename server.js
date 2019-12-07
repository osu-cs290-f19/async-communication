var path = require('path');
var fs = require('fs');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

var peopleData = require('./peopleData');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', function (req, res, next) {
  res.status(200).render('homePage');
});

app.get('/people', function (req, res, next) {
  res.status(200).render('peoplePage', {
    people: peopleData
  });
});

app.get('/people/:person', function (req, res, next) {
  var person = req.params.person.toLowerCase();
  if (peopleData[person]) {
    res.status(200).render('photoPage', peopleData[person]);
  } else {
    next();
  }
});

app.post('/people/:person/addPhoto', function (req, res, next) {
  var person = req.params.person.toLowerCase();
  if (peopleData[person]) {
    console.log("== req.body:", req.body);
    if (req.body && req.body.url && req.body.caption) {
      peopleData[person].photos.push({
        url: req.body.url,
        caption: req.body.caption
      });
      console.log("== peopleData[person]:", peopleData[person]);
      fs.writeFile(
        __dirname + '/peopleData.json',
        JSON.stringify(peopleData, 2, null),
        function (err) {
          if (!err) {
            res.status(200).send();
          } else {
            res.status(500).send("Failed to write data on server side.");
          }
        }
      );
    } else {
      res.status(400).send("Request body needs url and caption.");
    }
  } else {
    next();
  }
});

app.get('*', function (req, res, next) {
  res.status(404).render('404');
});

app.listen(port, function () {
  console.log("== Server listening on port", port);
})
