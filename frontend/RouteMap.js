var express = require('express');
var router = express.Router();
var http = require('http');

router.get('/', function(req, res) {
  res.render('test', { name: 'Welt' });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/logout', function(req, res) {
  req.session.user = undefined;
  res.redirect('/login');
});

router.post('/login', function(req, res) {
  if (req.session.user) return res.redirect('/');
  http.get("http://localhost:8888/api/users/" + req.body.id, function(userRes) {
    var body = '';
    userRes.on('data', function(chunk) {
      body += chunk;
    });
    userRes.on('end', function() {
      if(userRes.statusCode === 404) {
        return res.redirect('/login');
      }

      var user = JSON.parse(body);

      if (user.password !== undefined && req.body.password === user.password) {
        req.session.user = user;
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    });
  });
});

router.get('/groups', function(req, res) {
  http.get("http://localhost:8888/api/groups", function(groupsRes) {
    var body = '';
    groupsRes.on('data', function(chunk) {
      body += chunk;
    });
    groupsRes.on('end', function() {
      var groups = JSON.parse(body);

      // If no groups are registered
      // the service returns an error with a
      // message. We don't want to render
      // this in our view. 
      if (Array.isArray(groups)) {
        groups = groups.sort(function(a,b) {
          return b.id - a.id;
        });
      } else {
        groups = [];
      }
      res.render('groups', { groups: groups });
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

//========
// Events
//========

router.get('/events', function(req, res) {
  // GET request for all events
  http.get("http://localhost:8888/api/events", function(eventRes) {
    var body = '';

    // While still recieving data, append current chunk to body
    eventRes.on('data', function(chunk) {
      body += chunk;
    });

    // Data transfer has ended, do something with the data
    eventRes.on('end', function() {
      var events = JSON.parse(body);

      if(Array.isArray(events)) {
        // Sort by nearest DateTime later
        // Need to wait until all Events in DB have a Date and Time field.
      } else {
        //Set array empty to prevent error from being rendered in Client
        events= [];
      }

      // Render frontend with the recieved events
      res.render('event-main', { events: events });
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

router.get('/events/new', function(req, res) {
  res.render('event-new', { name: 'Welt' });
});

router.post('/events/new', function(req, res) {

  
  // Set options for request
  var post_options = {
      host: 'localhost',
      port: '8888',
      path: '/api/events',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(req.body))
      }
  };

  // Set up teh request
  var post_req = http.request(post_options, function(post_res) {
    post_res.setEncoding('utf8');
    var body = '';
    post_res.on('data', function(chunk) {
      body += chunk;
    });

    post_res.on('end', function() {
      var returns = JSON.parse(body);

      if(Array.isArray(returns)) {
        console.log('Success');
        console.log(returns);
        res.end();
      } else {
        console.log('Failure');
        res.end();
      }
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  }); 

  // post the data
  post_req.write(JSON.stringify(req.body));
  post_req.end();
  
}); 

module.exports = router;