var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/groups
// =================


/**

  TODO:
  - I mixed englisch and deutsche Kommantare überall
  - Our data structure is kinda wonky because the datasets
    are in the database without a schema
  - This is not DRY at all
  - Request Validation

**/

// Create Group
router.post('/', function (req, res) {
  db.incr('groupIDs', function (err, id) {
    if (err)
      return res.status(500).json({ message: 'Database write error', err: err });

    var group = req.body;
    group.id = id;
    group.members = [];

    db.set('group:' + id, JSON.stringify(group), function (err, newGroup) {
      if (err) return res.json(err);
      res.status(201);
      res.json(group);
    });
  });
});


// Get all groups
router.get('/', function (req, res) {
  db.keys('group:*', function (err, keys) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });

    db.mget(keys, function (err, groups) {
      if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
      // Value als JSON parsen
      groups = groups.map(function (group) { return JSON.parse(group) });

      res.json(groups);
    });
  });
});


// Get single group
router.get('/:id', function (req, res) {
  var id = req.params.id;
  db.get('group:' + id, function (err, group) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
    if (group === null) { // Wenn Gruppe nicht in Datenbank gefunden
      res.status(404);
      return res.send('Gruppe nicht gefunden.');
    }

    res.json(JSON.parse(group));
  });
});


// Update a group
router.put('/:id', function (req, res) {
  var id = req.params.id;

  // Zuerst die Gruppe aus der Datenbank holen
  db.get('group:' + id, function (err, group) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
    if (group === null)
      return res.status(404).json({ message: 'Group not found'});
    group = JSON.parse(group);

    // Dann die Werte nacheinander überschreiben/anlegen
    for (var data in req.body) {
      group[data] = req.body[data];
    }

    // Zum Schluss das geupdatete Objekt speichern
    db.set('group:' + id, JSON.stringify(group), function (err, saved) {
      if (err)
        return res.status(500).json({ message: 'Database write error', err: err });
      res.json(group);
    });
  });

});


// Add a member/user to a group
router.post('/:id/member', function (req, res) {
  var id = req.params.id;
  var member = req.body;

  db.get('group:' + id, function (err, group) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
    group = JSON.parse(group);

    db.get('user:' + member.id, function (err, user) {
      if (err)
        return res.status(500).json({ message: 'Database read error', err: err });
      if (user === null)
        return res.status(404).json({ message: 'User not found' });
      user = JSON.parse(user);


      // Members Array anlegen, falls nicht vorhanden oder nicht Array
      if (!group.members || !(group.members instanceof Array)) 
        group.members = [];

      group.members.push({ id: user.id });
      user.groups.push({ id: id });

      db.set('group:' + id, JSON.stringify(group), function (err, saved) {
        if (err)
          return res.status(500).json({ message: 'Database write error', err: err });

        db.set('user:' + member.id, JSON.stringify(user), function (err, ret) {
          if (err)
            return res.status(500).json({ message: 'Database write error', err: err });

          res.json(group);
        });
      });
    });
  });
});


// Delete member/user from group
router.delete('/:gid/member/:mid', function (req, res) {
  var groupId = req.params.gid;
  var memberId = req.params.mid;

  db.get('group:' + groupId, function (err, group) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
    var group = JSON.parse(group);

    // If no users in group, simply return it
    if (!group.members)
      return res.json(group);

    // Filter all the member who are NOT the to-be-deleted user
    group.members = group.members.filter(function (member) {
      return member.id != memberId;
    });

    db.get('user:' + memberId, function (err, user) {
      if (err)
        return res.status(500).json({ message: 'Database read error', err: err });
      var user = JSON.parse(user);
      user.groups = user.groups.filter(function (group) {
        return group.id !== groupId;
      });

      db.set('user:' + memberId, JSON.stringify(user), function (err, saved) {
        if (err)
          return res.status(500).json({ message: 'Database write error', err: err });

        if (group.members.length === 0) {
          db.del('group:' + groupId, function (err, ret) {
            if (err)
              return res.status(500).json({ message: 'Database delete error', err: err });
            res.json({});
          });
        } else {
          db.set('group:' + groupId, JSON.stringify(group), function (err, saved) {
            if (err)
              return res.status(500).json({ message: 'Database write error', err: err });
            res.json(group);
          });
        }
      });
    });
  });
});


// Get all users/members in a group
router.get('/:id/member', function (req, res) {
  var id = req.params.id;

  db.get('group:' + id, function (err, group) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
    if (group === null)
      return res.status(404).json({ message: 'Group does not exist' });

    group = JSON.parse(group);

    if (!group.members || group.members.length === 0)
      return res.status(404).json({ message: 'No members in group' });

    res.json(group.members);
  });
});


// Get all events from a group
router.get('/:id/event', function (req, res) {
  var id = req.params.id;

  db.get('group:' + id, function (err, group) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });

    group = JSON.parse(group);

    if (!group.events)
      return res.json([]);

    res.json(group.events);
  });
});


module.exports = router;