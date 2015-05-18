var express = require('express');
var router = express.Router();


// Routes /api
// =================

router.use('/events', require('./routes/EventRoutes'));
router.use('/users', require('./routes/UserRoutes'));
router.use('/groups', require('./routes/GroupRoutes'));


module.exports = router;