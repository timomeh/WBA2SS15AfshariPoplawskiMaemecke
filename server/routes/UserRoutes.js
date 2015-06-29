var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/users
// =================

// User Anlegen
router.post('/', function (req, res) {
  // Check all users if username already assigned
  db.keys('user:*', function(err, keys) {
    db.mget(keys, function(err, users) {
      if (users === undefined) {
        users = [];
      }
      users = users.map(function(user) {
        return JSON.parse(user);
      });
      var assigned = false;
      users.forEach(function(user) {
        if (user.name === req.body.name) assigned = true;
      });

      if (assigned) {
        return res.status(409).json({ message: 'Username already assigned'});
      }

      db.incr('userIDs', function (err, id) {
        var user = req.body;
        user.id = id;
        db.set('user:' + user.id, JSON.stringify(user), function (err, newUser) {
          res.status(201).json(user); 
       });
      });
    });
  });
});

// User ausgeben
router.get('/:name', function (req, res) {
  var name = req.params.name;
  db.keys('user:*', function(err, keys) {
    db.mget(keys, function(err, users) {
      users = users.map(function(user) {
        return JSON.parse(user);
      });

      var user;
      users.forEach(function(u) {
        if (u.name === name) {
          user = u;
        }
      });

      if (user === undefined) {
        res.status(404);
        return res.send('User nicht gefunden.');
      }

      res.json(user);
    });
  });
});
 
 
// User updaten
router.put('/:id', function (req, res) {
  var id = req.params.id;
 
  // Den User aus der Datenbank holen
  db.get('user:' + id, function (err, user) {
   if (user === null ) {
    res.status(404);
    return res.send();
  }
   user = JSON.parse(user);

 
    for (var data in req.body) {
      user[data] = req.body[data];
    }
 
    // Update speichern
    db.set('user:' + id, JSON.stringify(user), function (err, saved) {
      res.json(user);
    });
  });
 
});

// User löschen 
router.delete('/:id', function (req, res) {
  var id = req.params.id;
db.get('user:' + id,function (err,ret) {
  if (ret === null ) {
    res.status(404);
    return res.send();
  }
db.del('user:' + id, function (err, ret) {
    res.status(204);
		res.send();
	});
});
});
 
 
module.exports = router;