var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/events
// =================

router.post('/', function (req, res) {
  db.incr('eventIDs', function (err, id) {
    if(err) return res.status(500).send('Error while incrementing ID in Database');
    var event = req.body;
    
    // Set id of event to consitent one calculated by db
    event.id = id;

    db.set('event:' +id, JSON.stringify(event), function (err, rep) {
      if(err) return res.status(500).send('Error while writing to Database');
      res.status(201).json(event);
    })
  });
});


router.get('/:id', function (req, res) {
  var eventID = req.params.id;

  db.get('event:' +eventID, function(err, rep) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(rep == null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');
    res.json(JSON.parse(rep));
  });
});

router.put('/:id', function (req, res) {
  var eventID = req.params.id;
  


  db.get('event:' +eventID, function(err, rep){
    if(rep == null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    var event = JSON.parse(rep);
    
    // Update the event object
    for (var key in req.body) {
      event[key] = req.body[key];
    };

    db.set('event:' +eventID, JSON.stringify(event), function(err, repl) {
      if(err) return res.status(500).send('Error while writing to Database');
      res.json(event);
    });
  });
});

router.delete('/:id', function(req, res) {
  var eventID = req.params.id;
  
  db.get('event:' +eventID, function(err, rep) {
    if (rep == null) return res.status(404).send('No Event with the ID ' + eventID + ' was found'); 

    // Best Practice? Return deleted key/value?
    db.del('event:' +eventID, function(err, rep) {
    if(err) return res.status(500).send('Error while deleting from Database');
    return res.status(204).send('Successfully deleted event with the id ' +eventID);
  });

  });
  
});


router.post('/:id/member/', function(req, res) {
   var id = req.params.id;

  db.get('event:' +id, function(err, event) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(event == null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    event = JSON.parse(event);

    // Check if the event already has members to whom this member could be appended
    if('members' in event) {
      var members_arr = event.members;
    } else {
      var members_arr = [];
    }

    var member = req.body;

    // Check if the user to be added to the event exists
    db.get('user:' +member.id, function(err, user) {
      if(err) return res.status(500).send('Error while reading from database.');
      if(user == null) return res.status(404).send('No user with the id ' +member.id +' was found in the database.');

      members_arr.push({id:  member.id});
      event.members = members_arr;

      // Update the event
      db.set('event:' +id, JSON.stringify(event), function(err, rep) {
        if(err) return res.status(500).send('Error writing to database.');
        res.json(event);
      });
    });

  }); 
});


router.get('/:id/member', function (req, res) {
  var id = req.params.id;

  db.get('event:' +id, function(err, event) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(event == null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    event = JSON.parse(event);

    if('members' in event) {
      res.json(event.members);
    } else {
      return res.status(404).send('This event has no members yet.');
    }

  });
});

router.delete('/:id/member/:user', function(req, res) {
  var eventID = req.params.id;
  var userID = req.params.user;

  // Check if event from which a user is to be removed exists.
  db.get('event:' +eventID, function(err, event) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(event == null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    event = JSON.parse(event);

    // Check if Event has members
    if('members' in event) {
      for(var key in event.members) {

        // If the user is found in the event's members, delete him
        if(event.members[key].id == userID) {
          event.members.splice(key, 1);

          // Remove whole members-array if this was the last member
          if(!(event.members.length > 0)) {
            delete event.members;
          }

          // Update event
          db.set('event:' +eventID, JSON.stringify(event), function(err, rep) {
            if(err) return res.status(500).send('Error writing to database.');
            res.json(event);
          });
        } 
      }
    } else {
      // No members found for this event
      return res.status(404).send('This event has no members yet.');
    }

  });
});

module.exports = router;