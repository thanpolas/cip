/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview inherritance tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var inher = require('../');



// The numbering (e.g. 1.1.1) has nothing to do with order
// The purpose is to provide a unique string so specific tests are
// run by using the mocha --grep "1.1.1" option.

suite('2.0 Constructor tests', function() {
  setup(function() {});
  teardown(function() {});

  test('2.0.1 Extending with a constructor', function(done) {
    inher.extend(function() {
      done();
    }).getInstance();
  });
  test('2.0.1.1 Can extend without a ctor', function(){
    assert.doesNotThrow(inher.extend);
  });
  test('2.0.2 extend() produces the expected static methods', function() {
    var Child = inher.extend();
    assert.isFunction(Child.extend, 'extend');
    assert.isFunction(Child.getInstance, 'getInstance');
    assert.isFunction(Child.mixin, 'mixin');
  });

  test('2.0.3 extend() singleton has a reference to the ctor prototype', function() {
    var child = inher.extend().getInstance();
    assert.instanceOf(child, inher);
  });

  test('2.0.6 ctor "this" defined properties are inherrited', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });

    var GrandChild = Child.extend();
    var grandChild = new GrandChild();
    assert.property(grandChild, 'a');
    assert.equal(grandChild.a, 1);
  });

  test('2.0.7 ctor "this" defined properties have no side-effects', function() {
    var Child = inher.extend(function(){
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


suite('2.2 inherritance tests', function() {
  test('2.2.1 static methods are not inherrited', function(){
    var Child = inher.extend();
    Child.astaticfn = function(){};

    var GrandChild = Child.extend();

    assert.notProperty(GrandChild, 'astaticfn');
  });
  test('2.2.2 prototype methods are inherrited', function() {
    var Child = inher.extend();
    Child.prototype.add = function(a, b) { return a + b; };

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();

    assert.isFunction(grandChild.add);
    assert.equal(grandChild.add(1,1), 2);
  });

  test('2.2.3 getInstance returns the same instance', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });
    Child.prototype.add = function(a) { this.a += a; };

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();
    grandChild.add(1);

    var grandChildCopy = GrandChild.getInstance();
    assert.equal(grandChildCopy.a, 2);
  });
  test('2.2.4 parent ctor is on "super_"', function() {
    var Child = inher.extend();
    var GrandChild = Child.extend();
    assert.equal(GrandChild.super_, Child);
  });

});

