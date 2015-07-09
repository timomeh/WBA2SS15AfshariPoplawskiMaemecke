var http = require('http');
var notify = require('../NotificationHelper');
var async = require('async');


exports.showCreate = function(req, res) {
  http.get('http://localhost:8888/api/users/' + req.session.user.name, function(eventRes) {
		//TODO: Fetch the chunks
    //console.log(eventRes);
  });

  var groupIDs = req.session.user.groups;
  var allGroups = [];
	console.log(groupIDs);
	console.log(groupIDs[0]);
	console.log(groupIDs.length);

	// Get all groups the given user is a member of
	// This needs some GET request to the service and therefore
	// uses async.lib
	// The page is not rendered before all Groups are recieved.	
	// TODO: Render a different view when the User is not member of any groups
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



  // TODO: If the user is not a member of any Groups, let him creat a new one right away
	

};

exports.list = function(req, res) {
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
        console.log('Success');
        console.log(returns);
        res.redirect('/events/' + returns.id);

	// Send Notification to members of Gruop in which the Event was created
	// TODO: Get GroupID
	// console.log(req.body.groups);
	// TODO: Get IDs of Users in Group
	// TODO: Send Notification to every User
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
