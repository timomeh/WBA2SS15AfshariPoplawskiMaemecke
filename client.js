// ===================
// Module dependencies

var http = require('http');
var express = require('express');
var io = require('socket.io');
var bodyParser = require('body-parser');

// express-session is a server-session-management
// we use to create login-sessions
var session = require('express-session');

// consolidate is a convenient way to add  various
// view engines to express
var cons = require('consolidate');
var notify = require('./frontend/NotificationHelper');

// END Module dependencies
// =======================


var app = express();
var server = http.createServer(app);
var sio = io(server);


// =============
// express setup

app.set('port', process.env.PORT || 8000);

// assign the ejs engine to .ejs files
app.engine('ejs', cons.ejs);

// set .html as the default extension
app.set('view engine', 'ejs');
app.set('views', __dirname + '/frontend/views');

// END express setup
// =================


// ==========
// Middleware 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'totallysecret' }));
app.use(express.static(__dirname + '/frontend/public'));

// Attach socket.io to the req object of express.
// This way we can access socket.io in our routes
// to emit events.
app.use(function(req, res, next) {
  req.io = sio;
  next();
});

// (oversimplified) way to redirect
// not-logged-in users to the login-page
// and lock them out of protected user-pages
app.use(function(req, res, next) {

  // If session exists, user can access all pages
  if (req.session.user && req.originalUrl !== '/logout') {
    // Append Notifications to user session
    notify.fromUser(req.session.user.id, function(err, notifications) {
      var unread = notifications.filter(function(notification) {
        return notification.unread;
      });

      req.session.user.unreadNotifications = unread.length;
      req.session.user.notifications = notifications;
    });
    return next();
  }

  // If not, the user can only access /login and /signup
  // and will be redirected to /login, it he tried to
  // access anything else than /login or /signup.
  else {
    if (req.originalUrl === '/login' || req.originalUrl === '/signup') {
      return next();
    }
    res.redirect('/login');
  }
});

// Add the user-object (req.session.user) to res.locals,
// so we can access the user in the views.
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  if (res.locals.user !== undefined)
    delete res.locals.user.password;
  next();
});

// END Middleware
// ==============


// ======
// Routes

app.use('/', require('./frontend/RouteMap'));

// END Routes
// ==========


server.listen(app.get('port'), function () {
  console.log('Client is listening on port ' + app.get('port'));
});


sio.on('connection', function(socket) {
  socket.on('read', function(data) {
    notify.markAsRead(data.userId, data.notifyId, function(err) {
      // Blank?
    });
  });
});