var http = require('http');
var notify = require('../NotificationHelper');
var async = require('async');

/*
 *  This function renders event-new.ejs, allowing the User to
 *  create a new Event. 
 *
 *  If the user is not a member of any groups, the rendered view will
 *  be a little different and the user will not be able to creat an event. 
 */
exports.showCreate = function(req, res) {
  var groupIDs = req.session.user.groups;
  var allGroups = [];

  // The rendered view is a little different if the user is not member
  // of any groups
  if(groupIDs.length < 1) {

    // ATTENTION: If the user was a member of one or more groups before but
    // left them, this will lead to an error due to the incomplete function
    // for leavin groups.
    // More info in Issue #12
    res.render('event-new', {userGroups: false});
  }

	// Get all groups the given user is a member of
	// This needs some GET request to the service and therefore
	// uses async.lib
	// The page is not rendered before all Groups are recieved.	
	async.each(groupIDs, function(singleID, callback) {
		var groupBody = '';

		// Get a single Group by its ID
		http.get('http://localhost:8888/api/groups/' + singleID.id, function(groupRes) {
			groupRes.on('data', function(chunk) {
				groupBody += chunk;
			});

			groupRes.on('end', function() {
				allGroups.push(JSON.parse(groupBody));
				console.log(allGroups);
			});

			// This iteration is done, let async.lib know
			callback();
		});
	}, function(err) { // Final callback, all iterations finished
			// TODO: Do something with this error
			if(err) console.log('There was an error');

      // Render event-new.ejs and send all Groups of the given user
      res.render('event-new', {userGroups: allGroups});			
	});
};

exports.list = function(req, res) {

	// Make user object available in template
	res.locals.user = req.session.user;

  // GET request for all events
  http.get("http://localhost:8888/api/events", function(eventRes) {
    var body = '';

    // While still recieving data, append current chunk to body
    eventRes.on('data', function(chunk) {
      body += chunk;
    });

    // Data transfer has ended, do something with the data
    eventRes.on('end', function() {
      var events = JSON.parse(body);

      if(Array.isArray(events)) {
        // Sort by nearest DateTime later
        // Need to wait until all Events in DB have a Date and Time field.
				function compare(a,b) {
					if (a.date < b.date)
						return 1;
		 			if (a.date > b.date)
						return -1;
		  		return 0;
				}

				events.sort(compare);
      } else {
        //Set array empty to prevent error from being rendered in Client
        events= [];
      }

      // Render frontend with the recieved events
      res.render('event-main', { events: events });
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

exports.create = function(req, res) {
	
	// Set the creating user as first going user
	var going = [{id: req.session.user.id}];
	req.body.going = going;
  
  // Set options for request
  var post_options = {
      host: 'localhost',
      port: '8888',
      path: '/api/events',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(req.body))
      }
  };

  // Set up teh request
  var post_req = http.request(post_options, function(post_res) {
    post_res.setEncoding('utf8');
    var body = '';
    post_res.on('data', function(chunk) {
      body += chunk;
    });

    post_res.on('end', function() {
      var returns = JSON.parse(body);

      if( (typeof returns === 'object') && (returns !== null)) {
       	
				// Debugs
				console.log('Success');
        console.log(returns);
				console.log("GroupID is " + returns.groupid);
				
				// Send Notification to members of Gruop in which the Event was created
					
				var groupBody = '';
				// Get a single Group by its ID
				http.get('http://localhost:8888/api/groups/' + returns.groupid, function(groupRes) {
					groupRes.on('data', function(chunk) {
						groupBody += chunk;
					});

					groupRes.on('end', function() {
						console.log("I got the whole Group: " + groupBody);
					
						groupBody = JSON.parse(groupBody);	

						async.each(groupBody.members, function(singleMember, callback) {
							// Debug
							console.log(singleMember.id);
							
							var notification = {
								message: "In deiner Gruppe " + groupBody.name + "  wurde das Event " + returns.name + " erstellt",
								type: "EVENTINVITE",
								groupId: returns.groupid,
								fromId: req.session.user.id,
								eventId: returns.id
							};

							// Only send the notification if the current user is not the user
							// who created the event
							if(!(singleMember.id === req.session.user.id)) {
								notify.toUser(req, singleMember.id, notification, function(err) {
									if(err) console.log(err);
								});
							}

							callback();

						}, function(err) {
							if (err) console.log(err);				
        			res.redirect('/events/' + returns.id);
						});
					});
				});



	      } else {
        console.log('Failure');
        res.end();
      }
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  }); 

  

  // post the data
  post_req.write(JSON.stringify(req.body));
  post_req.end();
  
};

exports.show = function(req, res) {
  // GET request for all events
  http.get("http://localhost:8888/api/events/" + req.params.id, function(eventRes) {
    var body = '';

    // While still recieving data, append current chunk to body
    eventRes.on('data', function(chunk) {
      body += chunk;
    });

    // Data transfer has ended, do something with the data
    eventRes.on('end', function() {
      var event = JSON.parse(body);

      if((typeof event === 'object') && (event !== null)) {
        // Render frontend with the recieved events
        res.render('event-single', { event: event });
      } else {
        //Set array empty to prevent error from being rendered in Client
        //Should also render a 404 page
        events= [];
      }

      
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

exports.respondInvite = function(req, res) {
	// Variables
	var groupId = req.body.groupId;
	var userId = req.session.user.id;
	var userName = req.session.user.name;
	var notifyId = req.body.notifyId;
	//TODO: Handle the invite response
	
	// DEBUG
	console.log("respondInvite called");
	console.log(req.body);
		
	if(req.body.type === 'notGoing') {
		// TODO: Is there something that needs to happen if someone isn't going?
	} else {
		var groupBody = '';

		// GET request to retrieve the current list of going members
		// We well append the current user to it and the send it via a PUT Method back to
		// the server
		http.get('http://localhost:8888/api/events/' + req.body.eventId, function(eventRes) {
			eventRes.on('data', function(groupChunk) {
				groupBody += groupChunk;
			});
			
			// GET request has finished	
			eventRes.on('end', function() {
				groupBody = JSON.parse(groupBody);

				// Append the current user to the going users
				var goingUsers = groupBody.going.slice();
				var currUser = {id: req.session.user.id};
				goingUsers.push(currUser);
				var goingStruct = {'going': goingUsers}; // Way too tired, no idea what im doing 

				// Set up the PUT request
				var put_options = {
				  host: 'localhost',
				  port: '8888',
				  path: '/api/events/' + req.body.eventId,
				  method: 'PUT',
				  headers: {
				      'Content-Type': 'application/json',
				      'Content-Length': Buffer.byteLength(JSON.stringify(goingStruct))
					}
				};
				
				var put_req = http.request(put_options, function(put_res) {
					put_res.setEncoding('utf8');
					var body = '';
					
					console.log('Entered put_req');	

					put_res.on('data', function(chunk) {
				  	body += chunk;
						console.log('Recvieved part of body: ' + body);
					});

					put_res.on('end', function() {
						console.log('Returns from put_req: ' + body);
					});
				});

				put_req.on('error', function(e) {
					console.log(e.message);
				});

				put_req.write(JSON.stringify(goingStruct));
				console.log(goingStruct);
				put_req.end();
				
				// Delete notification and notify the creator of the event someone accepted an Invite
				// TODO: Notify ALL user going to the event	
				var notification = {
					message: userName + ' hat einem Event zugesagt.'
				};
				notify.delete(userId, notifyId, function () {
					notify.toUser(req, req.body.fromID, notification, function(err) {
									console.log('Notification was fired');
									if (err) return res.json({error: 'there was an error'});
									res.redirect('/notifications');
					});
				});
			});
		});

		// TODO: Redirect User to Event?
	}
};
