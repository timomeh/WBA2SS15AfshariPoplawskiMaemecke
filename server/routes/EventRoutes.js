var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/events
// =================

/*
 *  POST-Request on /events.
 *  Checks, if the Gruop in which the event is created exists, then creates the event.
 *  Also updates the group with the newly created event.
 *
 *  NOTE: No validation of the values for the group is done. We rely on the client to send
 *  correct data.
 */
router.post('/', function (req, res) {

  // TODO: Only set specific variables

  //DEBUG 
  console.log("Entered POST on Server, recieved " + JSON.stringify(req.body));

  // Increment eventIDs to give the new event a correct and unique ID
  db.incr('eventIDs', function (err, id) {
    if(err) return res.status(500).send('Error while incrementing ID in Database');
    var event = req.body;
    
    // Set id of event to consitent one calculated by db
    event.id = id;
    var groupID = event.groupid;

    // Get the group in which the event was created and check if it exists
    db.get('group:' +groupID, function(err, group) {
      if(err) return res.status(500).send('Error while reading from database');
      if(group === null) return res.status(404).send('Group with the ID ' + groupID + ' was not found in database');

      var group = JSON.parse(group);

      // If the group has no events-prameter yet, set one.
      if (!group.events)
        group.events = [];

      group.events.push({ id: event.id });

      // Write the group with the updated event and the event itself
      // to the database
      db.set('group:' +groupID, JSON.stringify(group), function (err, rep) {
        if(err) return res.status(500).send('Error while writing to Database');

        db.set('event:' +id, JSON.stringify(event), function (err, rep) {
          if(err) return res.status(500).send('Error while writing to Database');
          res.status(201).json(event);
        }); 
      });
    });
  });
});

/*
 *  GET-Request for /events.
 *  Returns all events saved in the database
 */
router.get('/', function(req, res) {

  // Get all keys prefixed with event
  db.keys('event:*', function (err, keys) {
    if (err)
      return res.status(500).json({ message: 'Database read error', err: err });

    // Send all keys we received, values returned are the events.
    db.mget(keys, function (err, events) {
      if (err)
      return res.status(500).json({ message: 'Database read error', err: err });
      
      // Parse value as JSON
      events = events.map(function (event) { return JSON.parse(event) });

      res.status(200).json(events);
    });
  });
});

/*
 *  GET-Request for the event of a specific ID.
 */
router.get('/:id', function (req, res) {
  var eventID = req.params.id;

  // Get the event with the desired ID from database.
  db.get('event:' +eventID, function(err, rep) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(rep === null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');
    res.status(200).json(JSON.parse(rep));
  });
});

/*
 *  PUT-Request for an event with a specific ID.
 *  Checks the Original Object in the database and only updates changed values,
 *  old and unchaged values stay in the object.
 *  Also, if you send new keys with the request, those are written to the object,too.
 */
router.put('/:id', function (req, res) {
	
	// DEBUG
	console.log('PUT on server revieved: ' + req.params);	
	
  var eventID = req.params.id;
  
  // Get the event that needs to be changed
  db.get('event:' +eventID, function(err, rep){
    if(rep === null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    var event = JSON.parse(rep);
    
    // Update the event object
    for (var key in req.body) {
      event[key] = req.body[key];
    };

    // Wirte the changed object to database
    db.set('event:' +eventID, JSON.stringify(event), function(err, repl) {
      if(err) return res.status(500).send('Error while writing to Database');
      res.json(event);
    });
  });
});

/*
 *  DELETE-Request for an specific event.
 *  Checkes if the event to be deleted exists and if so deletes it.
 */
router.delete('/:id', function(req, res) {
  var eventID = req.params.id;
  
  // Get the event to be deleted
  db.get('event:' +eventID, function(err, rep) {
    if (rep === null) return res.status(404).send('No Event with the ID ' + eventID + ' was found'); 

    // Best Practice? Return deleted key/value?
    db.del('event:' +eventID, function(err, rep) {
    if(err) return res.status(500).send('Error while deleting from Database');
    return res.status(204).send('Successfully deleted event with the id ' +eventID);
  });

  });
  
});

/*
 *  POST-Request to add a member to a specific event.
 *  Checks if teh event exists and already has the key 'members' in it.
 *  If not, creates the key for the event.
 *
 *  NOTE: With our client, on event creation an 'members'-array is created too
 *  and the creator listed as first member. We cannot be sure all clients will do this,
 *  tehrefor we check if the key already exists.
 */
router.post('/:id/member/', function(req, res) {
  var id = req.params.id;

  // Check if the event exists
  db.get('event:' +id, function(err, event) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(event === null) return res.status(404).send('No event with the id ' +id +' was found in the database.');

    event = JSON.parse(event);

    // Check if the event already has members to whom this member could be appended
    if('member' in event) {
      var members_arr = event.member;
    } else {
      var members_arr = [];
    }

    var member = req.body;

    // Check if the user to be added to the event exists
    db.get('user:' +member.id, function(err, user) {
      if(err) return res.status(500).send('Error while reading from database.');
      if(user === null) return res.status(404).send('No user with the id ' +member.id +' was found in the database.');

      // Check, if the user already is a member of the given event
      for (var i = 0, len = members_arr.length; i < len; i++) {
          if(members_arr[i].id == member.id) 
            return res.status(409).send('User with the ID ' +member.id + ' is already member of this event');
      }     

      // User existes, not yet member, add him to the members array
      members_arr.push({id:  member.id});
      event.member = members_arr;

      // Update the event with the modified members array
      db.set('event:' +id, JSON.stringify(event), function(err, rep) {
        if(err) return res.status(500).send('Error writing to database.');
        res.status(200).json(event);
      });
    });

  }); 
});

/*
 *  GET-Request for all members of an event.
 */
router.get('/:id/member', function (req, res) {
  var id = req.params.id;

  // Get the desired event and check if it exists
  db.get('event:' +id, function(err, event) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(event === null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    event = JSON.parse(event);

    // DEBUG
    console.log(event);
    console.log(event.member);

    // Check, if the event has any members
    if('member' in event) {
      res.status(200).json(event.member);
    } else {
      return res.status(404).send('This event has no members yet.');
    }

  });
});

/*
 *  DELETE-Request to delete a specific user as the member of an event.
 */
router.delete('/:id/member/:user', function(req, res) {
  var eventID = req.params.id;
  var userID = req.params.user;

  // Check if event from which a user is to be removed exists.
  db.get('event:' +eventID, function(err, event) {
    if(err) return res.status(500).send('Error while reading from database.');
    if(event === null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    event = JSON.parse(event);

    // Check if Event has members
    if('member' in event) {
      for(var key in event.member) {

        // If the user is found in the event's members, delete him
        if(event.member[key].id == userID) {
          event.member.splice(key, 1);

          // Remove whole members-array if this was the last member
          if(!(event.member.length > 0)) {
            delete event.member;
          }

          // Update event
          db.set('event:' +eventID, JSON.stringify(event), function(err, rep) {
            if(err) return res.status(500).send('Error writing to database.');
            res.status(200).json(event);
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
