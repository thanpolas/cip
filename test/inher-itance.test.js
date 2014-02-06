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

suite('2.3 Mixins tests', function() {
  test('2.3.1 Mixin ctor gets invoked', function(done) {
    var Child = inher.extend(function() {
      this.a = 1;
    });
    var ChildToMixin = inher.extend(done);
    Child.mixin(ChildToMixin);

    var child = new Child();
  });
  test('2.3.1.2 Instance shares same context with mixin', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });
    var ChildToMixin = inher.extend(function() {
      this.b = 2;
    });
    Child.mixin(ChildToMixin);

    var child = new Child();

    assert.equal(child.a, 1);
    assert.equal(child.b, 2);
  });

  test('2.3.2 Ctor passes the mixin', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = inher.extend(function() {
      this.b = 2;
    });

    Child.mixin(ChildToMixin);

    var GrandChild = Child.extend(function() {
      this.c = 3;
    });

    var grandChild = new GrandChild();

    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.b, 2);
    assert.equal(grandChild.c, 3);
  });
  test('2.3.3 mixin accepts an array of ctors', function() {
    var spyChild = sinon.spy();
    var spyMixinOne = sinon.spy();
    var spyMixinTwo = sinon.spy();
    var spyMixinThree = sinon.spy();
    var spyGrandChild = sinon.spy();

    var Child = inher.extend(spyChild);

    var ChildToMixin = inher.extend(spyMixinOne);
    var ChildToMixinTwo = inher.extend(spyMixinTwo);
    var ChildToMixinThree = inher.extend(spyMixinThree);

    Child.mixin([ChildToMixin, ChildToMixinTwo, ChildToMixinThree]);

    var GrandChild = Child.extend(spyGrandChild);

    var grandChild = new GrandChild();

    assert.ok(spyChild.calledOnce, 'spyChild should be called only once. Was Called:' + spyChild.callCount);
    assert.ok(spyMixinOne.calledOnce, 'spyMixinOne should be called only once. Was Called:' + spyMixinOne.callCount);
    assert.ok(spyMixinTwo.calledOnce, 'spyMixinTwo should be called only once. Was Called:' + spyMixinTwo.callCount);
    assert.ok(spyMixinThree.calledOnce, 'spyMixinThree should be called only once. Was Called:' + spyMixinThree.callCount);
    assert.ok(spyGrandChild.calledOnce, 'spyGrandChild should be called only once. Was Called:' + spyGrandChild.callCount);
  });
  test('2.3.3.2 mixin invokes ctors in the right order', function() {
    var spyChild = sinon.spy();
    var spyMixinOne = sinon.spy();
    var spyMixinTwo = sinon.spy();
    var spyMixinThree = sinon.spy();
    var spyGrandChild = sinon.spy();

    var Child = inher.extend(spyChild);

    var ChildToMixin = inher.extend(spyMixinOne);
    var ChildToMixinTwo = inher.extend(spyMixinTwo);
    var ChildToMixinThree = inher.extend(spyMixinThree);

    Child.mixin([ChildToMixin, ChildToMixinTwo, ChildToMixinThree]);

    var GrandChild = Child.extend(spyGrandChild);

    var grandChild = new GrandChild();

    assert.ok(spyMixinOne.calledBefore(spyMixinTwo), 'spyMixinOne() before spyMixinTwo()');
    assert.ok(spyMixinTwo.calledBefore(spyMixinThree), 'spyMixinTwo() before spyMixinThree()');
    assert.ok(spyMixinThree.calledBefore(spyChild), 'spyMixinThree() before spyChild()');
    assert.ok(spyChild.calledBefore(spyGrandChild), 'spyChild() before spyGrandChild()');
  });

  test('2.3.3.3 mixin ctors share the same context', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = inher.extend(function() {this.b = 2;});
    var ChildToMixinTwo = inher.extend(function() {this.c = 3;});
    var ChildToMixinThree = inher.extend(function() {this.d = 4;});

    Child.mixin([ChildToMixin, ChildToMixinTwo, ChildToMixinThree]);

    var GrandChild = Child.extend(function() {
      this.e = 5;
    });

    var grandChild = new GrandChild();

    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.b, 2);
    assert.equal(grandChild.c, 3);
    assert.equal(grandChild.d, 4);
    assert.equal(grandChild.e, 5);
  });
  test('2.3.4 mixin accepts comma separated ctors', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = inher.extend(function() {this.b = 2;});
    var ChildToMixinTwo = inher.extend(function() {this.c = 3;});
    var ChildToMixinThree = inher.extend(function() {this.d = 4;});

    Child.mixin(ChildToMixin, ChildToMixinTwo, ChildToMixinThree);

    var GrandChild = Child.extend(function() {
      this.e = 5;
    });

    var grandChild = new GrandChild();

    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.b, 2);
    assert.equal(grandChild.c, 3);
    assert.equal(grandChild.d, 4);
    assert.equal(grandChild.e, 5);
  });
  test('2.3.5 We can interact with the Mixin this object', function() {
    var Child = inher.extend(function() {
      this.a += 1;
    });

    var ChildToMixin = inher.extend(function() {
      this.a = 1;
    });

    Child.mixin(ChildToMixin);
    var child = new Child();
    assert.equal(child.a, 2);
  });


  test('2.3.10 Mixin prototype methods get passed down the chain', function() {
    var Child = inher.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = inher.extend();
    ChildToMixin.prototype.add = function(a, b) {
      return a + b;
    };

    Child.mixin(ChildToMixin);

    var GrandChild = Child.extend(function() {
      this.c = 3;
    });

    var grandChild = new GrandChild();

    assert.isFunction(grandChild.add);
    assert.equal(grandChild.add(1, 1), 2);
  });
});
