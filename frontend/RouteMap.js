var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('test', { name: 'Welt' });
})

router.get('/events', function(req, res) {
  res.render('event-main', { name: 'Welt' });
})

module.exports = router;