var fs = require('fs');

fs.readFile('wolkenkratzer.json', function (err, content) {
  if (err) return console.log(err);
  var parsed = JSON.parse(content);
  parsed.wolkenkratzer.forEach(function (tower) {
    logTower(tower);
    console.log('--------------------');
  });
});

function logTower(tower) {
  console.log('Name: ' + tower.name);
  console.log('Stadt: ' + tower.stadt);
  console.log('Höhe: ' + tower.hoehe);
}