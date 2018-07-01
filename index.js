var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./'));

app.post('/save', function(req, res) {
  const filePath = path.join(__dirname, 'robots', req.body.name + '.js');
  console.log('New robot saved at ', filePath, req.body.code.length);
  fs.writeFile(filePath, req.body.code, (err) => {
    if (err) throw err;
    res.send({ sucess: true });
  });

});
app.get('/robots', function(req, res) {
  const filePath = path.join(__dirname, 'robots');
  fs.readdir(filePath, (err, response) => {
    const result = response
    .filter((file) => file.indexOf('.js') !== -1)
    .map((file) => file.replace('.js', ''));
    console.log('result', result)
    res.send(result);
  })
});
app.get('/robot/:fileName', function(req, res) {
  const filePath = path.join(__dirname, 'robots', req.params.fileName + '.js');
  console.log('filePath', filePath);
  fs.readFile(filePath, (err, response) => res.send(response));
});
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
