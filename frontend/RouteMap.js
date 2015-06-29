var express = require('express');
var router = express.Router();

var UsersController = require('./controller/UsersController');
var GroupsController = require('./controller/GroupsController');
var EventsController = require('./controller/EventsController');
var NotificationsController = require('./controller/NotificationsController');


router.get('/', function(req, res) {
  res.render('home');
});

router.get('/notifications', function(req, res) {
  res.render('notifications');
});

// Yeah, this could be a .delete
// But I want to show that the client doesn't
// need to be REST compliant.
router.post('/notifications/delete', NotificationsController.delete);


/*==========  User  ==========*/

router.get('/user', UsersController.showUser);
router.get('/signup', UsersController.showSignup);
router.post('/signup', UsersController.create); 
router.get('/login', UsersController.showLogin);
router.post('/login', UsersController.login);
router.get('/logout', UsersController.logout);



/*==========  Groups  ==========*/

router.get('/groups', GroupsController.list);
router.post('/groups/invite', GroupsController.invite);
router.post('/groups/invite/respond', GroupsController.respondInvite);



/*==========  Events  ==========*/

router.get('/events', EventsController.list);
router.get('/events/new', EventsController.showCreate);
router.post('/events/new', EventsController.create);
router.get('/events/:id', EventsController.show); 



module.exports = router;