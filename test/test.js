/*jshint bitwise: false*/
'use strict';

exports.lab = require('./helpers/test-helper').lab;
var describe = require('./helpers/test-helper').describe;
var it = require('./helpers/test-helper').it;
var expect = require('./helpers/test-helper').expect;

var gulp = require('gulp');
var task = require('../');
var through = require('through2');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var filename = path.join(__dirname, './fixtures/helloworld.js');
var exportFilename = path.join(__dirname, './fixtures/exports.js');
var jst = fs.readFileSync(path.join(__dirname, '../templates/amd.jst'), 'utf-8');

function expectStream(options, done){
  options = _.defaults(options || {}, {
    deps: null,
    params: null,
    exports: null,
    contents: null,
    name: null
  });
  return through.obj(function(file, enc, cb){
    options.contents = fs.readFileSync(file.path, 'utf-8');
    var expected = _.template(jst, options);
    var results = String(file.contents);
    expect(results).to.deep.equal(expected);
    cb();
    done();
  });
}

describe('WrapAmd module', function(){
  it('should wrap a function in simple AMD wrapper', function(done){
    gulp.src(filename)
      .pipe(task())
      .pipe(expectStream({}, done));
  });

  it('should wrap a function in simple AMD wrapper if missing deps but has params', function(done){
    var opts = {
      params: ['jade']
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream({}, done));
  });

  it('should wrap a function in AMD wrapper with custom deps and params', function(done){
    var opts = {
      deps: ['jade'],
      params: ['jade']
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(opts, done));
  });

  it('should wrap a function in AMD wrapper with custom deps', function(done){
    var opts = {
      deps: ['domReady!']
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(opts, done));
  });

  it('should wrap a function in AMD wrapper with custom return variable', function(done){
    var opts = {
      exports: 'helloWorld'
    };
    gulp.src(exportFilename)
      .pipe(task(opts))
      .pipe(expectStream(opts, done));
  });

  it('should isolate the contents of the individual files', function(done){
      var opts = {
        deps: ['test']
      };
      gulp.src(path.join(__dirname, './fixtures/test-*.js'))
        .pipe(task(opts))
        .pipe(expectStream(opts, done));
  });

  it('should include module name if moduleRoot option is given', function(done) {
    var opts = {
      moduleRoot: 'test/',
      deps: ['jade'],
      params: ['jade']
    };
    var exportOpts = {
      deps: ['jade'],
      params: ['jade'],
      name: 'fixtures/helloworld'
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(exportOpts, done));
  });

  it('module name should be relative to moduleRoot', function(done) {
    var opts = {
      moduleRoot: 'test/fixtures/',
      deps: ['jade'],
      params: ['jade']
    };
    var exportOpts = {
      deps: ['jade'],
      params: ['jade'],
      name: 'helloworld'
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(exportOpts, done));
  });

  it('modulePrefix option requires moduleRoot existence', function(done) {
    var opts = {
      modulePrefix: 'rocks/',
      deps: ['jade'],
      params: ['jade']
    };
    var exportOpts = {
      deps: ['jade'],
      params: ['jade'],
      name: null
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(exportOpts, done));
  });

  it('should prepend the modulePrefix in the module name defination', function(done) {
    var opts = {
      moduleRoot: 'test/fixtures/',
      modulePrefix: 'rocks/',
      deps: ['jade'],
      params: ['jade']
    };
    var exportOpts = {
      deps: ['jade'],
      params: ['jade'],
      name: 'rocks/helloworld'
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(exportOpts, done));
  });

  it('should add trailing slash to modulePrefix if not existed in the module name defination', function(done) {
    var opts = {
      moduleRoot: 'test/fixtures/',
      modulePrefix: 'rocks',
      deps: ['jade'],
      params: ['jade']
    };
    var exportOpts = {
      deps: ['jade'],
      params: ['jade'],
      name: 'rocks/helloworld'
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(expectStream(exportOpts, done));
  });

  it('does not have windows separaters in moduleId', function(done){
    var opts = {
      moduleRoot: 'test/fixtures/',
      modulePrefix: 'rocks',
      deps: ['jade'],
      params: ['jade']
    };
    gulp.src(filename)
      .pipe(task(opts))
      .pipe(through.obj(function(file, enc, cb){
        expect(!!~String(file.contents).indexOf("rocks/helloworld")).to.be.true();
        cb();
        done();
      }));
  });
});
