var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

fs.readFile(path.join(__dirname, 'wolkenkratzer.json'), function (err, content) {
  if (err) return console.log(err);
  var parsed = JSON.parse(content);

  parsed.wolkenkratzer.sort(function(a, b) {
  	return a.hoehe - b.hoehe;
  });

	fs.writeFile('wolkenkratzer_sortiert.json', JSON.stringify(parsed, null, 2), function (err) {
	  if (err) throw err;
	  console.log('wolkenkratzer_sortiert.json saved!');

	  parsed.wolkenkratzer.forEach(function (tower) {
    	logTower(tower);
    	console.log('--------------------');
  	});
	});

  
});

function logTower(tower) {
  console.log('Name: ' + chalk.green(tower.name));
  console.log('Stadt: ' + chalk.blue(tower.stadt));
  console.log('Höhe: ' + chalk.red(tower.hoehe));
}