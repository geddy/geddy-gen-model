var jake = require('jake');
var path = require('path');
var genutils = require('geddy-genutils');
var validTasks = ['default', 'create', 'help'];
var ns = 'model';

module.exports = function(appPath, args) {
  genutils.jake.run(__dirname, ns, validTasks, args);
};