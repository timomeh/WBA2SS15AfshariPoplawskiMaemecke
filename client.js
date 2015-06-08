var express = require('express');

// Express instance
var app = express();
app.set('port', process.env.PORT || 8000);

// Routes are in app/routes.js
app.use('/api', require('./app/RouteMap'));


// Start the server
app.listen(app.get('port'), function () {
  console.log('Client is listening on port ' + app.get('port'));
});