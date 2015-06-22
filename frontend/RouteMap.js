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

router.get('/events', function(req, res) {
  res.render('event-main', { name: 'Welt' });
});

module.exports = router;