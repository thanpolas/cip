/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview Singleton Inheritance specific tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var Cip = require('../');

suite('Constructor tests Singleton inheritance', function() {
  test('"new" and "getInstance()" return the same instance', function() {
    var Child = Cip.extendSingleton(function() {
      this.a = 1;
    });
    var child = Child.getInstance();
    child.a++;
    var samechild = new Child();
    assert.isEqual(samechild.a, 2);
  });

  test('extendSingleton() singleton has a reference to the ctor prototype', function() {
    var child = Cip.extendSingleton().getInstance();
    assert.instanceOf(child, Cip);
  });
});
