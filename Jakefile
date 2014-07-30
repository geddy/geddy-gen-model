var path = require('path')
  , fs = require('fs')
  , cwd = process.cwd()
  , utilities = require('utilities')
  , genutils = require('geddy-genutils')
  , genDirname = __dirname;

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

var _formatModelProperties = function (properties) {
  var obj = {default: {name: '', type: ''}};
  if (!properties) {
    return obj;
  }
  obj['default'].name = 'id';
  obj['default'].type = 'string';

  var itemsArr = properties
    , name
    , type
    , args
    , i
    , value;

  i = -1;
  while (++i < itemsArr.length) {
    // ignore invalid property names
    if (['_','-'].indexOf(itemsArr[i].charAt(0)) != -1) continue;

    value = itemsArr[i].split(':');
    name = utils.string.camelize(value.shift());
    type = value.shift() || '';
    args = value.shift() || '';

    // Take off any args on the type
    type = type.replace(/:.*/g, '');

    // Defaults and aliases
    if (!type) {
      type = 'string';
    }
    if (args === 'def') {
      args = 'default';
    }

    switch (type) {
      case 'integer':
        type = 'int';
        break;
      case 'bool':
        type = 'boolean';
        break;
      case 'default':
      case 'def':
        type = 'string';
        args = 'default';
        break;
    }

    // Manage properties that deal with changing default properties
    if (args === 'default') {
      // Reset old default property to its own property, only if it's not
      // already the default
      if (name !== obj['default'].name) {
        // If the new default item already exists then delete it
        if (obj[name]) {
          delete obj[name];
        }

        obj[obj['default'].name] = obj[obj['default'].name] || obj['default'];
      }

      // Add new default property
      obj['default'] = {name: name, type: type};
      continue;
    }

    // If ID property is given and it matches the default
    // then rewrite the default with the new ID property
    if (name === 'id' && obj['default'].name === 'id') {
      obj['default'] = {name: name, type: type};
      continue;
    }

    // If the name is name or title then set them to default, otherwise add
    // the property normally
    if (name === 'name' || name === 'title') {
      // Reset old default to its own property
      obj[obj['default'].name] = obj[obj['default'].name] || obj['default'];

      // Add new default property
      obj['default'] = {name: name, type: type};
    } else {
      obj[name] = {name: name, type: type};
    }
  }

  return obj;
};

// Tasks
task('default', function() {
  var self = this;
  var t = jake.Task.create;
  t.reenable();
  t.invoke.apply(t, Array.prototype.slice.call(arguments));
});

task('create', function () {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  if (args.length < 1) {
    fail('No model name specified.');
    return;
  }

  var force = genutils.flagSet('-f','--force');
  var name = args.shift();
  var properties = (args.length > 0) ? args : null;

  var props = _formatModelProperties(properties)
    , createTableTask;
  if (!name) {
    fail('No model name specified.');
    return;
  }

  var appPath = process.cwd();
  var modelsDir = path.join(appPath, 'app', 'models');
  if (!fs.existsSync(modelsDir) || !fs.statSync(modelsDir).isDirectory()) {
    fail('You must run this generator from the root of your application.');
    return;
  }

  // sanitize the controller name
  var modelFileName = name.toLowerCase().replace(/\s|-/g, '_');
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
  jake.Task['create-test'].invoke(name);

  // create db directory if not existing yet
  jake.mkdirP(path.join(appPath, 'db'));

  // Create the corresponding migration
  createTableTask = jake.Task['migration:createForTable'];
  createTableTask.invoke(name, props);
});

// Delegate to stuff in jakelib/migration.jake
task('migration', function (name) {
  if (!name) {
    throw new Error('No migration name provided.');
  }
  var t = jake.Task['migration:create'];
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

testTask('Model', ['clean', 'prepare-test-app'], function() {
  this.testFiles.exclude('test/helpers/**');
  this.testFiles.exclude('test/fixtures/**');
  this.testFiles.exclude('test/geddy-test-app');
  this.testFiles.exclude('test/tmp/**');
  this.testFiles.include('test/**/*.js');
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