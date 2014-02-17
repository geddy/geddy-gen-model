var fs = require('fs');
var path = require('path')
  , geddyPath = path.normalize(path.join(require.resolve('geddy'), '../../'));

// Load the basic Geddy toolkit
require(path.join(geddyPath,'lib/geddy'));

// Dependencies
var cwd = process.cwd()
  , utils = require(path.join(geddyPath, 'lib/utils'))
  , Adapter = require(path.join(geddyPath, 'lib/template/adapters')).Adapter
  , genDirname = __dirname;

var _writeTemplate = function (name, filename, dirname, opts) {
  var options = opts || {}
    , names = utils.string.getInflections(name)
    , text = fs.readFileSync(path.join(genDirname, filename + '.ejs'), 'utf8').toString()
    , bare = options.bare || false // Default to full controller
    , adapter
    , templContent
    , fileDir
    , filePath;

  // Render with the right model name
  adapter = new Adapter({engine: 'ejs', template: text});
  templContent = adapter.render({names: names, bare: bare, properties: options.properties});

  // Write file
  fileDir = dirname;
  if (!utils.file.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
  }

  filePath = path.join(fileDir, names.filename[options.inflection] + '.js');
  fs.writeFileSync(filePath, templContent, 'utf8');

  console.log('[Added] ' + filePath);
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

function flagSet(shortName, name) {
  return process.argv.indexOf(shortName) !== -1 && process.argv.indexOf(name);
}

// Tasks
task('default', {async: true}, function() {
  var self = this;
  var t = jake.Task.create;
  t.reenable();
  t.once('done', function() {
    complete();
    self.emit('done');
  });
  t.invoke.apply(t, Array.prototype.slice.call(arguments));
});

task('create', {async: true}, function () {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  if (args.length < 1) {
    fail('No model name specified.');
    return;
  }

  var force = flagSet('-f','--force');
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
  jake.Task.test.invoke(name);

  // Create the corresponding migration
  createTableTask = jake.Task['migration:createForTable'];
  createTableTask.on('complete', function () {
    complete();
    self.emit('done');
  });
  createTableTask.invoke(name, props);
});

// Delegate to stuff in jakelib/migration.jake
task('migration', {async: true}, function (name) {
  if (!name) {
    throw new Error('No migration name provided.');
  }
  var t = jake.Task['migration:create'];
  t.on('complete', function () {
    complete();
  });
  t.invoke.apply(t, arguments);
});

task('test', function (name) {
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