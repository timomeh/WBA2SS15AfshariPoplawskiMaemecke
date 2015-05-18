var express = require('express');
var redis = require('redis');
var router = express.Router();
var db = redis.createClient();


// Routes /api/events
// =================

router.post('/', function (req, res) {
  var id = events.length;

  var event = {};
  event.id = id;
  event.name = req.body.name;
  event.time = req.body.time;
  events.push(event);
  res.json(event);
});

router.get('/', function (req, res) {
  res.json(events);
});

router.get('/:id', function (req, res) {
  res.json(events[req.params.id]);
});

router.put('/:id', function (req, res) {
  events[req.params.id].name = req.body.name;
  events[req.params.id].time = req.body.time;
  res.json(events[req.params.id]);
});



module.exports = router;