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

suite('Wrap tests', function() {
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

  test('Wrap adds all Inher props and methods', function() {
    var InherTypicalCtor = inher.wrap(TypicalCtor);
    assert.ok(inher.isInher(InherTypicalCtor));
    assert.isFunction(InherTypicalCtor.extend, 'InherTypicalCtor should have an "extend" static method');
    assert.isFunction(InherTypicalCtor.getInstance, 'InherTypicalCtor should have a "getInstance" static method');
    assert.notProperty(InherTypicalCtor, 'wrap', 'InherTypicalCtor should *not* have a "wrap" static method');
    assert.notProperty(InherTypicalCtor, 'isInher', 'InherTypicalCtor should *not* have a "isInher" static method');
  });
  test('extending wrapped constructors retains instanceof', function() {
    var InherTypicalCtor = inher.wrap(TypicalCtor);
    var Child = InherTypicalCtor.extend();

    assert.instanceOf(Child.getInstance(), TypicalCtor);
  });
  test('Wrapping constructors does not mutate original Ctor', function() {
    var InherTypicalCtor = inher.wrap(TypicalCtor);
    var Child = InherTypicalCtor.extend();

    assert.notProperty(TypicalCtor, 'extend');
    assert.notOk(inher.isInher(TypicalCtor));
  });
});
