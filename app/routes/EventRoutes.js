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
      res.json(event);
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
  var event = req.body;
  event.id = eventID;

  db.get('event:' +eventID, function(err, rep){
    if(rep == null) return res.status(404).send('No event with the id ' +eventID +' was found in the database.');

    db.set('event:' +eventID, JSON.stringify(event), function(err, rep) {
      if(err) return res.status(500).send('Error while writing to Database');
      res.json(event);
    });
  });
});

router.delete('/:id', function(req, res) {
  var eventID = req.params.id;
  
  // Best Practice? Return deleted key/value?
  db.del('event:' +eventID, function(err, rep) {
    if(err) return res.status(500).send('Error while deleting from Database');
    return res.status(200).send('Successfully deleted event with the id ' +eventID);
  })
});



module.exports = router;