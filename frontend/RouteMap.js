var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('test', { name: 'Welt' });
})

router.get('/events', function(req, res) {
  res.render('event-main', { name: 'Welt' });
})

router.get('/events/new', function(req, res) {
  res.render('event-new', { name: 'Welt' });
})

module.exports = router;