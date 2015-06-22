var express = require('express');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var session = require('express-session');

// Express instance
var app = express();
app.set('port', process.env.PORT || 8000);

// assign the ejs engine to .ejs files
app.engine('ejs', cons.ejs);

// set .html as the default extension
app.set('view engine', 'ejs');
app.set('views', __dirname + '/frontend/views');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({ secret: 'totallysecret' }));

app.use(express.static(__dirname + '/frontend/public'));

app.use(function(req, res, next) {
	if (req.session.user) {
		return next();
	} else {
		if (req.originalUrl === '/login' || req.originalUrl === '/signup') {
			return next();
		}
		res.redirect('/login');
	}
});
app.use(function(req, res, next) {
	res.locals.user = req.session.user;
	if (res.locals.user !== undefined)
		delete res.locals.user.password;
	next();
});

// Routes are in app/routes.js
app.use('/', require('./frontend/RouteMap'));


// Start the server
app.listen(app.get('port'), function () {
  console.log('Client is listening on port ' + app.get('port'));
});