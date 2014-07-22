var CreateZoobies = function () {
  this.up = function (next) {
    var def = function (t) {
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('zooby', def, callback);
  };

  this.down = function (next) {
    var callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.dropTable('zooby', callback);
  };
};

exports.CreateZoobies = CreateZoobies;
