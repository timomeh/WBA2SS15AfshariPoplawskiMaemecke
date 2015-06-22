var express = require('express');
var router = express.Router();
var http = require('http');

router.get('/', function(req, res) {
  res.render('test', { name: 'Welt' });
})

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