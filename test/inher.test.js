var chai = require('chai');
var assert = chai.assert;

var inher = require('../');

/*
  ======== A Handy Little Mocha Reference ========
  https://github.com/visionmedia/mocha/

  Test assertions:
    assert.fail(actual, expected, message, operator)
    assert(value, message), assert.ok(value, [message])
    assert.equal(actual, expected, [message])
    assert.notEqual(actual, expected, [message])
    assert.deepEqual(actual, expected, [message])
    assert.notDeepEqual(actual, expected, [message])
    assert.strictEqual(actual, expected, [message])
    assert.notStrictEqual(actual, expected, [message])
    assert.throws(block, [error], [message])
    assert.doesNotThrow(block, [message])
    assert.ifError(value)

    Apart from assert, Mocha allows you to use any of the following assertion libraries:
    - should.js
    - chai
    - expect.js
    - better-assert
*/




// var noop = function(){};

setup(function() {});
teardown(function() {});

// The numbering (e.g. 1.1.1) has nothing to do with order
// The purpose is to provide a unique string so specific tests are
// run by using the mocha --grep "1.1.1" option.

suite('1.1 API Surface', function() {
  test('1.1.1 Exported Methods', function() {
    assert.isFunction(inher, 'inher core is a "constructor"');
    assert.isFunction(inher.extend, 'inher should have an "extend" static method');
    assert.isFunction(inher.getInstance, 'inher should have a "getInstance" static method');
    assert.isFunction(inher.isInher, 'inher should have a "isInher" static method');
    assert.isFunction(inher.wrap, 'inher should have a "wrap" static method');
  });
});


suite('1.2 isInher() function', function() {
  test('1.2.1 identifies core as inher', function() {
    assert.ok(inher.isInher(inher));
  });
  test('1.2.2 identifies extended class as inher', function() {
    var Child = inher.extend();
    assert.ok(inher.isInher(Child));
  });
  test('1.2.3 identifies extended class with ctor as inher', function() {
    var Child = inher.extend(function(){});
    assert.ok(inher.isInher(Child));
  });
  test('1.2.4 identifies extended classes as inher down 10 levels', function() {
    var howDeep = 10;
    function recurse(Parent) {
      var Child = Parent.extend();
      assert.ok(inher.isInher(Child), 'Child at level ' + howDeep + ' should yield true for inInher()');

      if (--howDeep) {
        recurse(Child);
      }
    }
    recurse(inher);
  });

});
