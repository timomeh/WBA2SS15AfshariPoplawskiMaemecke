var notify = require('../NotificationHelper');

exports.delete = function(req, res) {
  var userid = req.session.user.id;

  notify.delete(userid, req.body.notifyId, function() {
    res.redirect('/notifications');
  });
};