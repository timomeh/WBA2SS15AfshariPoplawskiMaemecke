var express = require('express');
var cons = require('consolidate');

// Express instance
var app = express();
app.set('port', process.env.PORT || 8000);

// assign the ejs engine to .ejs files
app.engine('ejs', cons.ejs);

// set .html as the default extension
app.set('view engine', 'ejs');
app.set('views', __dirname + '/frontend/views');

// Routes are in app/routes.js
app.use('/', require('./frontend/RouteMap'));


// Start the server
app.listen(app.get('port'), function () {
  console.log('Client is listening on port ' + app.get('port'));
});