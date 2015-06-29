var redis = require('redis');
var db = redis.createClient();

exports.toUser = function(req, userId, notification, cb) {
  db.incr('notificationIDs:' + userId, function (err, id) {
    if (err) return cb(err);

    var newNotification = notification;
    newNotification.unread = true;
    newNotification.id = id;

    db.set('notifications:user:' + userId + ':' + id, JSON.stringify(newNotification), function(err, res) {
      cb(err, newNotification);
    });

    req.io.emit(userId, newNotification);
  });
};

exports.fromUser = function(userId, cb) {
  db.keys('notifications:user:' + userId + ':*', function (err, keys) {
    if (err) return cb(err);
    if (keys.length === 0) return cb(null, []);

    db.mget(keys, function (err, notifications) {
      if (err) return cb(err);

      // Value als JSON parsen
      notifications = notifications.map(function (notification) { return JSON.parse(notification) });

      notifications = notifications.sort(function(a,b) {
        return b.id - a.id;
      });

      cb(err, notifications);
    });
  });
};

exports.markAsRead = function(userId, notificationId, cb) {
  var key = 'notifications:user:' + userId + ':' + notificationId;
  db.get(key, function(err, notification) {
    if (err) return cb(err);
    notification = JSON.parse(notification);
    notification.unread = false;

    db.set(key, JSON.stringify(notification), function(err, ret) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};

exports.delete = function(userId, notificationId, cb) {
  var key = 'notifications:user:' + userId + ':' + notificationId;
  db.del(key, function(err, ret) {
    cb(err);
  });
};