var express        = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// Express instance
var app = express();
app.set('port', process.env.PORT || 8888);

// Middleware
app.use(methodOverride());
app.use(bodyParser.json());

// Routes are in app/routes.js
app.use('/api', require('./app/RouteMap'));


// Start the server
app.listen(app.get('port'), function () {
  console.log('Server is listening on port ' + app.get('port'));
});