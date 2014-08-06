var utils = require('utilities');

function formatModelProperties(properties) {
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
}
module.exports.formatModelProperties = formatModelProperties;