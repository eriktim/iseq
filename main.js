var express = require('express');
var fs = require('fs');
var path = require('path');

var filePath = '/home/erik/git/timelapse/testdata/';
var app = express();
app.disable('x-powered-by');

var getDirs = function(dir, done, dirOnly) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) {
      return done(err);
    }
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) {
        return done(null, results);
      }
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results.push(file);
        }
        next();
      });
    })();
  });
};

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
  getDirs(filePath, function(err, dirs) {
    if (err) {
      if (err.code == 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        console.error(err.toString());
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200);
      dirs.forEach(function(dir) {
        res.write(dir.replace(filePath, '').substring(1) + '\n');
      });
      res.end();
    }
  });
});

app.get('/:album', function(req, res) {
  res.sendFile('iseq.html', {root: './static'});
});

app.get('/:album/seq', function(req, res) {
  var album = req.params.album;
  console.log('requested ' + album);
  var jsonFile = filePath + album + '/iseq.json';
  fs.readFile(jsonFile, function(err, contents) {
    var config = {};
    if (err) {
      if (err.code != 'ENOENT') {
        console.error(err.toString());
      }
    } else {
      try {
        config = JSON.parse(contents);
      } catch (e) {
        console.error('failed parsing ' + jsonFile);
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    }
    fs.readdir(filePath + album, function(err, files) {
      if (err) {
        if (err.code == 'ENOENT') {
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          console.error(err.toString());
          res.writeHead(500);
          res.end('500 Internal Server Error');
        }
      } else {
        var sequence = config.sequence || [];
        var isChanged = false;
        var index = sequence.length + 1;
        var ref = sequence.length > 0 ? sequence[0].ref : undefined;
        files.sort().forEach(function(file) {
          var ext = path.extname(file).toLowerCase();
          if (['.jpg', '.jpeg'].indexOf(ext) < 0) {
            return;
          }
          var frame = sequence.find(f => f.file == album + '/' + file);
          if (!frame) {
            isChanged = true;
            sequence.push({
              index: index++,
              file: album + '/' + file,
              ref: ref,
              points: [],
              refPoints: [],
              skip: false
            });
          } else {
            ref = frame.ref || ref;
          }
          if (!ref) {
            ref = album + '/' + file;
          }
        });
        config.path = filePath;
        config.width = 0;
        config.height = 0;
        config.sequence = sequence;
        res.json(config);
        if (isChanged) {
          var jsonString = JSON.stringify(config, null, 2);
          fs.writeFile(jsonFile, jsonString, function(err) {
            if (err) {
              console.error(err);
            } else {
              console.log('wrote ' + jsonFile);
            }
          });
        }
      }
    });
  });
});

app.get('/:album/:file', function(req, res) {
  res.sendFile(req.params.file, {root: filePath + req.params.album});
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('iseq server listening at http://%s:%s', host, port);
});
