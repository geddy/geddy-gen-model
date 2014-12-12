var path = require('path')
  , fs = require('fs')
  , cwd = process.cwd()
  , utilities = require('utilities')
  , helpers = require('./helpers')
  , genutils = require('geddy-genutils')
  , genDirname = __dirname;

var ns = 'model';

// Load the basic Geddy toolkit
genutils.loadGeddy();
var utils = genutils.loadGeddyUtils();

var _writeTemplate = function (name, filename, dirname, opts) {
  var options = opts || {}
    , names = utils.string.getInflections(name)
    , bare = options.bare || false; // Default to full controller

  genutils.template.write(
    path.join(genDirname, filename + '.ejs'),
    path.join(dirname, names.filename[options.inflection] + '.js'),
    {names: names, bare: bare, properties: options.properties}
  );
};

// Tasks
task('default', function() {
  var self = this;
  var t = jake.Task['model:create'];
  t.reenable();
  t.invoke.apply(t, Array.prototype.slice.call(arguments));
});

namespace(ns, function() {
  task('create', function () {
    if (!genutils.inAppRoot()) {
      fail('You must run this generator from the root of your application.');
      return;
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments);

    if (args.length < 1) {
      fail('No model name specified.');
      return;
    }

    var force = genutils.flagSet('-f','--force');
    var name = args.shift();
    var properties = (args.length > 0) ? args : null;

    var props = helpers.formatModelProperties(properties)
      , createTableTask;
    if (!name) {
      fail('No model name specified.');
      return;
    }

    var appPath = process.cwd();
    var modelsDir = path.join(appPath, 'app', 'models');

    // sanitize the controller name
    var modelFileName = utilities.string.getInflection(name, 'filename', 'singular')
                        .toLowerCase().replace(/\s|-/g, '_');
    var modelFilePath = path.join(modelsDir, modelFileName + '.js');

    if (!force && fs.existsSync(modelFilePath)) {
      fail('Model already exists. Use -f to replace it.');
      return;
    }

    var modelPath = path.join('template' ,'model.js');

    _writeTemplate(name, modelPath, modelsDir, {
      inflection: 'singular'
      , properties: props
    });

    // Create model test scaffold
    jake.Task['model:create-test'].invoke(name);

    // create db directory if not existing yet
    jake.mkdirP(path.join(appPath, 'db'));

    // Create the corresponding migration
    createTableTask = jake.Task['model:migration:createForTable'];
    createTableTask.invoke(name, props);
  });

// Delegate to stuff in jakelib/migration.jake
  task('migration', function (name) {
    if (!name) {
      throw new Error('No migration name provided.');
    }
    var t = jake.Task['model:migration:create'];
    t.invoke.apply(t, arguments);
  });

  task('create-test', function (name) {
    if (!name) {
      throw new Error('No test name specified.');
    }

    _writeTemplate(name, path.join('template', 'test_model.js'), path.join('test', 'models'),
      {inflection: 'singular'});
  });

  task('help', function() {
    console.log(
      fs.readFileSync(
        path.join(__dirname, 'help.txt'),
        {encoding: 'utf8'}
      )
    );
  });

  desc('Clears the test temp directory.');
  task('clean', function() {
    console.log('Cleaning temp files ...');
    var tmpDir = path.join(__dirname, 'test', 'tmp');
    utilities.file.rmRf(tmpDir, {silent:true});
    fs.mkdirSync(tmpDir);
  });

  desc('Copies the test app into the temp directory.');
  task('prepare-test-app', function() {
    console.log('Preparing test app ...');
    jake.cpR(
      path.join(__dirname, 'test', 'geddy-test-app'),
      path.join(__dirname, 'test', 'tmp'),
      {silent: true}
    );
    console.log('Test app prepared.');
  });
});

testTask('Model', ['model:clean', 'model:prepare-test-app'], function() {
  this.testFiles.exclude('test/helpers/**');
  this.testFiles.exclude('test/fixtures/**');
  this.testFiles.exclude('test/geddy-test-app');
  this.testFiles.exclude('test/tmp/**');
  this.testFiles.include('test/**/*.js');
});