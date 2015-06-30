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

exports.respondInvite = function(req, res) {
  var userid = req.session.user.id;
  var groupid = req.body.groupId;
  var type = req.body.type;
  var notifyId = req.body.notifyId;

  if (type === 'decline') {
    
  }
  else {
    var datasend = JSON.stringify({ id: userid });

    var post_options = {
      host: 'localhost',
      port: '8888',
      path: '/api/groups/' + groupid + '/member/',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(datasend)
      }
    };

    var post_req = http.request(post_options, function(post_res) {
      post_res.setEncoding('utf8');
      var body = '';

      post_res.on('data', function(chunk) {
        body += chunk;
      });

      post_res.on('end', function() {
        var returns = JSON.parse(body);

        var notification = {
          message: req.session.user.name + " hat die Einladung angenommen!"
        };
        notify.delete(userid, notifyId, function() {
          notify.toUser(req, req.body.fromId, notification, function(err) {
            if (err) return res.json({ error: 'some error occured' });

            res.redirect('/notifications');
          });
        });
      });
    });

    // post the data
    post_req.write(datasend);
    post_req.end();
  }
};

exports.invite = function(req, res) {
  var inviteUserName = req.body.username;
  var inviteGroupId = parseInt(req.body.groupId);

  // Check if user is adding himself
  if (inviteUserName === req.session.user.name) {
    return res.json({ error: 'SAMEUSER' });
  }

  // Get requested user
  http.get('http://localhost:8888/api/users/' + inviteUserName, function(userRes) {
    var body = '';
    userRes.on('data', function(chunk) {
      body += chunk;
    });

    // Check if User exists
    userRes.on('end', function() {
      if(userRes.statusCode === 404) {
        return res.json({ error: 'USERNOTFOUND' });
      }

      var user = JSON.parse(body);

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
            if (member.id === user.id) {
              return res.json({ error: 'ALREADYINGROUP' });
            }
          });

          var notification = {
            message: "Du wurdest eingeladen in Gruppe " + inviteGroupId,
            type: 'GROUPINVITE',
            groupId: inviteGroupId,
            fromId: req.body.fromId
          };
          notify.toUser(req, user.id, notification, function(err) {
            if (err) return res.json({ error: 'some error occured' });

            res.status(204).end();
          });
        });
      });
    });
  });
  
};