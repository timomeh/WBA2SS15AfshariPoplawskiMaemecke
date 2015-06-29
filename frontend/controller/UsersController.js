var http = require('http');


exports.showUser = function(req, res) {
  res.render('user-main', { name: 'User' });
};


exports.showSignup = function(req, res) {
  res.render('signup', { name: 'Signup' });
};

exports.showLogin = function(req, res) {
  res.render('login');
};


exports.login = function(req, res) {
  if (req.session.user) return res.redirect('/');
  http.get("http://localhost:8888/api/users/" + req.body.id, function(userRes) {
    var body = '';
    userRes.on('data', function(chunk) {
      body += chunk;
    });
    userRes.on('end', function() {
      if(userRes.statusCode === 404) {
        return res.redirect('/login');
      }

      var user = JSON.parse(body);

      if (user.password !== undefined && req.body.password === user.password) {
        req.session.user = user;
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    });
  });
};

exports.logout = function(req, res) {
  req.session.user = undefined;
  res.redirect('/login');
};

exports.create = function(req, res) {

  
  var post_options = {
      host: 'localhost',
      port: '8888',
      path: '/api/users',
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

      if(Array.isArray(returns)) {
        console.log('Success');
        console.log(returns);
        res.end();
      } else {
        console.log('Failure');
         res.redirect('/login');
      }
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  }); 

  // post the data
  post_req.write(JSON.stringify(req.body));
  post_req.end();
  
};