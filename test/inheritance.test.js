/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview Cipritance tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var Cip = require('../');

suite('Constructor tests', function() {
  setup(function() {});
  teardown(function() {});

  test('Extending with a constructor', function(done) {
    Cip.extend(function() {
      done();
    }).getInstance();
  });
  test('Can extend without a ctor', function(){
    assert.doesNotThrow(Cip.extend);
  });
  test('extend() produces the expected static methods', function() {
    var Child = Cip.extend();
    assert.isFunction(Child.extend, 'extend');
    assert.isFunction(Child.getInstance, 'getInstance');
    assert.isFunction(Child.mixin, 'mixin');
  });

  test('extend() singleton has a reference to the ctor prototype', function() {
    var child = Cip.extend().getInstance();
    assert.instanceOf(child, Cip);
  });

  test('ctor "this" defined properties are Ciprited', function() {
    var Child = Cip.extend(function() {
      this.a = 1;
    });

    var GrandChild = Child.extend();
    var grandChild = new GrandChild();
    assert.property(grandChild, 'a');
    assert.equal(grandChild.a, 1);
  });

  test('ctor "this" defined properties have no side-effects', function() {
    var Child = Cip.extend(function(){
      this.a = 1;
      this.obj = {
        b: 2,
      };
    });
    var child = Child.getInstance();
    child.a = 3;
    child.obj.b = 6;

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();
    assert.property(grandChild, 'a');
    assert.property(grandChild, 'obj');
    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.obj.b, 2);

    grandChild.a = 5;
    grandChild.obj.b = 9;
    assert.equal(child.a, 3);
    assert.equal(child.obj.b, 6);
  });

});

suite('Cipritance tests', function() {
  test('static methods are not Ciprited', function(){
    var Child = Cip.extend();
    Child.astaticfn = function(){};

    var GrandChild = Child.extend();

    assert.notProperty(GrandChild, 'astaticfn');
  });
  test('prototype methods are Ciprited', function() {
    var Child = Cip.extend();
    Child.prototype.add = function(a, b) { return a + b; };

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();

    assert.isFunction(grandChild.add);
    assert.equal(grandChild.add(1,1), 2);
  });

  test('getInstance returns the same instance', function() {
    var Child = Cip.extend(function() {
      this.a = 1;
    });
    Child.prototype.add = function(a) { this.a += a; };

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();
    grandChild.add(1);

    var grandChildCopy = GrandChild.getInstance();
    assert.equal(grandChildCopy.a, 2);
  });

  test('parent ctor is on "super_"', function() {
    var Child = Cip.extend();
    var GrandChild = Child.extend();
    assert.equal(GrandChild.super_, Child);
  });

  test('Constructors are invoked in the expected order', function() {
    var spyOne = sinon.spy();
    var spyTwo = sinon.spy();
    var spyThree = sinon.spy();
    var spyFour = sinon.spy();
    var spyFive = sinon.spy();

    var Child = Cip.extend(spyOne);
    var GrandChild = Child.extend(spyTwo);
    var GreatGrandChild = GrandChild.extend(spyThree);
    var GreatGreatGrandChild = GreatGrandChild.extend(spyFour);
    var GreatGreatGreatGrandChild = GreatGreatGrandChild.extend(spyFive);

    GreatGreatGreatGrandChild.getInstance();

    assert.ok(spyOne.calledBefore(spyTwo), 'Child called before GrandChild');
    assert.ok(spyTwo.calledBefore(spyThree), 'GrandChild called before GreatGrandChild');
    assert.ok(spyThree.calledBefore(spyFour), 'GreatGrandChild called before GreatGreatGrandChild');
    assert.ok(spyFour.calledBefore(spyFive), 'GreatGreatGrandChild called before GreatGreatGreatGrandChild');
  });
});

