/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview extend argument tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var inher = require('../');



// The numbering (e.g. 1.1.1) has nothing to do with order
// The purpose is to provide a unique string so specific tests are
// run by using the mocha --grep "1.1.1" option.

suite('2.1 Constructor arguments tests', function() {
  test('2.1.1 Constructors can accept arguments', function() {
    var Child = inher.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var child = new Child(1, 2);
    var childSingleton = Child.getInstance(3, 4);

    assert.equal(child.a, 1);
    assert.equal(child.b, 2);
    assert.equal(childSingleton.a, 3);
    assert.equal(childSingleton.b, 4);
  });
  test('2.1.2 Constructor arguments can be stubed by childs', function() {
    var Child = inher.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(5, 6, function(arg3) {
      this.c = arg3;
    });

    var grandChild = new GrandChild('lol');
    var grandChildSingleton = GrandChild.getInstance(0);

    assert.equal(grandChild.a, 5);
    assert.equal(grandChild.b, 6);
    assert.equal(grandChild.c, 'lol');
    assert.equal(grandChildSingleton.a, 5);
    assert.equal(grandChildSingleton.b, 6);
    assert.equal(grandChildSingleton.c, 0);
  });
  test('2.1.2.2 Constructor arguments can be partially stubed by childs', function() {
    var Child = inher.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(5, function(arg2, arg3) {
      this.c = arg3;
    });

    var grandChild = new GrandChild(9, 'lol');
    var grandChildSingleton = GrandChild.getInstance(8, 0);

    assert.equal(grandChild.a, 5);
    assert.equal(grandChild.b, 9);
    assert.equal(grandChild.c, 'lol');
    assert.equal(grandChildSingleton.a, 5);
    assert.equal(grandChildSingleton.b, 8);
    assert.equal(grandChildSingleton.c, 0);
  });

  test('2.1.2.3 Constructor arguments can be compositevely stubed by childs', function() {
    var Child = inher.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(5, function(arg2, arg3) {
      this.b = arg2;
      this.c = arg3;
    });

    var GreatGrandChild = GrandChild.extend(6);

    var greatGrandChild = new GreatGrandChild('lol');
    var greatGrandChildSingleton = GreatGrandChild.getInstance(0);

    assert.equal(greatGrandChild.a, 5);
    assert.equal(greatGrandChild.b, 6);
    assert.equal(greatGrandChild.c, 'lol');
    assert.equal(greatGrandChildSingleton.a, 5);
    assert.equal(greatGrandChildSingleton.b, 6);
    assert.equal(greatGrandChildSingleton.c, 0);
  });


  test('2.1.3 Constructor stubed arguments do not get confused with fn as args', function() {
    var Child = inher.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(function(){this.b++;}, 6, function(arg3) {
      this.c = arg3;
    });

    var grandChild = new GrandChild('lol');
    var grandChildSingleton = GrandChild.getInstance(0);

    assert.isFunction(grandChild.a);
    grandChild.a();
    assert.equal(grandChild.b, 7);
    assert.equal(grandChild.c, 'lol');
    assert.isFunction(grandChildSingleton.a);
    grandChildSingleton.a();
    grandChildSingleton.a();
    assert.equal(grandChildSingleton.b, 8);
    assert.equal(grandChildSingleton.c, 0);
  });
  test('2.1.4 Constructor stubed arguments can omit ctor', function() {
    var Child = inher.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(function(){this.b++;}, 6);

    var grandChild = new GrandChild();
    var grandChildSingleton = GrandChild.getInstance();

    assert.isFunction(grandChild.a);
    grandChild.a();
    assert.equal(grandChild.b, 7);
    assert.isFunction(grandChildSingleton.a);
    grandChildSingleton.a();
    grandChildSingleton.a();
    assert.equal(grandChildSingleton.b, 8);
  });


});
