var assert = require('assert')
  , tests
  , Zooby = geddy.model.Zooby;

tests = {

  'after': function (next) {
    // cleanup DB
    Zooby.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var zooby = Zooby.create({});
    zooby.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
