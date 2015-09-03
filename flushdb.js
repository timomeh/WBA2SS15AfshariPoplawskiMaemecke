var redis = require('redis');
var db = redis.createClient();
db.flushdb(function(err, result) {
  console.log(result);
  process.exit(0);
});