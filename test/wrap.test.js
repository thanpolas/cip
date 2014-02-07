/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview Wrapping tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var inher = require('../');



// The numbering (e.g. 1.1.1) has nothing to do with order
// The purpose is to provide a unique string so specific tests are
// run by using the mocha --grep "1.1.1" option.

suite('4.1 Wrap tests', function() {
  var TypicalCtor;
  setup(function(){
    TypicalCtor = function () {
      this.a = 1;
      this.ron = null;
      this.s = 'zztop';
    };
    TypicalCtor.prototype.add = function() {
      return ++this.a;
    };

  });

  test('4.1.1 Wrap adds all Inher props and methods', function(done) {
    var InherTypicalCtor = inher.wrap(TypicalCtor);
    assert.ok(inher.isInher(InherTypicalCtor));
    assert.isFunction(InherTypicalCtor.extend, 'InherTypicalCtor should have an "extend" static method');
    assert.isFunction(InherTypicalCtor.getInstance, 'InherTypicalCtor should have a "getInstance" static method');
    assert.notProperty(InherTypicalCtor, 'wrap', 'InherTypicalCtor should *not* have a "wrap" static method');
    assert.notProperty(InherTypicalCtor, 'isInher', 'InherTypicalCtor should *not* have a "isInher" static method');
  });
  test('4.1.2 extending wrapped constructors retains instanceof', function(done) {
    var InherTypicalCtor = inher.wrap(TypicalCtor);
    var Child = InherTypicalCtor.extend();

    assert.instanceOf(Child.getInstance(), TypicalCtor);
  });
});
