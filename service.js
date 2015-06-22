var express        = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cors           = require('cors');

// Express instance
var app = express();
app.set('port', process.env.PORT || 8888);

// Middleware
app.use(cors()); // Required to call the server with ajax on the client
app.use(methodOverride());
app.use(bodyParser.json());

// Routes are in app/routes.js
app.use('/api', require('./server/RouteMap'));


// Start the server
app.listen(app.get('port'), function () {
  console.log('Server is listening on port ' + app.get('port'));
});

module.exports.express = app;