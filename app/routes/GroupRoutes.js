var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/groups
// =================


router.post('/', function (req, res) {
  db.incr('groupIDs', function (err, id) {
    var group = req.body;
    group.id = id;

    db.set('group:'+id, JSON.stringify(group), function (err, newGroup) {
      if (err) return res.json(err);
      res.json(group);
    });
  });
});


module.exports = router;