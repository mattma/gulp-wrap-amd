'use strict';

exports.lab = require('./helpers/test-helper').lab;
var describe = require('./helpers/test-helper').describe;
var it = require('./helpers/test-helper').it;
var expect = require('./helpers/test-helper').expect;

var task = require('../');

var path = require('path');
var fs = require('fs');
var File = require('gulp-util').File;
var PluginError = require('gulp-util').PluginError;

var filePath = path.join(__dirname, 'fixtures', 'helloworld.js');
var base = path.join(__dirname, 'fixtures');
var cwd = __dirname;

var file = new File({
  path: filePath,
  base: base,
  cwd: cwd,
  contents: fs.createReadStream(filePath)
});

describe('WrapAmd module stream', function(){
  it('should error if contents is a stream', function(done){
    var stream = task();
    stream.on('error', function(err){
      expect(err instanceof PluginError).to.be.true();
      stream.end();
    });
    stream.write(file);
    stream.end();
    done();
  });
});
