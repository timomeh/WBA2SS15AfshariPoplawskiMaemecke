var http = require('http');
var notify = require('../NotificationHelper');

exports.list = function(req, res) {
  http.get("http://localhost:8888/api/groups", function(groupsRes) {
    var body = '';
    groupsRes.on('data', function(chunk) {
      body += chunk;
    });
    groupsRes.on('end', function() {
      var groups = JSON.parse(body);

      // If no groups are registered
      // the service returns an error with a
      // message. We don't want to render
      // this in our view. 
      if (Array.isArray(groups)) {
        groups = groups.filter(function(group) {
          var found = false;
          if (group.members === undefined) return false;

          group.members.forEach(function(member) {
            if (member.id === req.session.user.id) {
              found = true;
            }
          });
          return found;
        });

        groups = groups.sort(function(a,b) {
          return b.id - a.id;
        });
      } else {
        groups = [];
      }
      res.render('groups', { groups: groups });
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

exports.invite = function(req, res) {
  var inviteUserId = parseInt(req.body.userId);
  var inviteGroupId = parseInt(req.body.groupId);

  // Check if user is adding himself
  if (inviteUserId === req.session.user.id) {
    return res.json({ error: 'SAMEUSER' });
  }

  // Get group members
  http.get('http://localhost:8888/api/groups/' + inviteGroupId + '/member/', function(membersRes) {
    var body = '';
    membersRes.on('data', function(chunk) {
      body += chunk;
    });
    membersRes.on('end', function() {
      // Check if group exists
      if (membersRes.statusCode === 404) {
        return res.json({ error: 'GROUPNOTFOUND' });
      }

      body = JSON.parse(body);

      // Check if User is already in group
      body.forEach(function(member) {
        if (member.id === inviteUserId) {
          return res.json({ error: 'ALREADYINGROUP' });
        }
      });

      // Get requested user
      http.get('http://localhost:8888/api/users/' + inviteUserId, function(userRes) {
        var body = '';
        userRes.on('data', function(chunk) {
          body += chunk;
        });

        // Check if User exists
        userRes.on('end', function() {
          if(userRes.statusCode === 404) {
            return res.json({ error: 'USERNOTFOUND' });
          }


          var notification = {
            message: "Du wurdest eingeladen in Gruppe " + inviteGroupId
          };
          notify.toUser(req, inviteUserId, notification, function(err) {
            if (err) return res.json({ error: 'some error occured' });

            res.status(204).end();
          });
        });
      });
    });
  });
  
};