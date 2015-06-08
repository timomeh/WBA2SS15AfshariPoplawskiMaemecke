var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/users
// =================

// User Anlegen
router.post('/', function (req, res) {
  db.incr('userIDs', function (err, id) {
    var user = req.body;
    user.id = id;
    db.set('user:' + user.id, JSON.stringify(user), function (err, newUser) {
    	
      res.status(201).json(user); 
	 });
  });
});

// User ausgeben
router.get('/:id', function (req, res) {
  var id = req.params.id;
  db.get('user:' + id, function (err, user) {
    if (user === null) { // Wenn User nicht in Datenbank gefunden
      res.status(404);
      return res.send('User nicht gefunden.');
    }
 
    res.json(JSON.parse(user));
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