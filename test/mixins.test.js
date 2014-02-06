/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview mixins tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var inher = require('../');



// The numbering (e.g. 1.1.1) has nothing to do with order
// The purpose is to provide a unique string so specific tests are
// run by using the mocha --grep "1.1.1" option.

suite('3.3 Mixins tests', function() {
  test('3.3.1 Mixin ctor gets invoked', function(done) {
    var Child = inher.extend(function() {
      this.a = 1;
    });
    var ChildToMixin = inher.extend(done);
    Child.mixin(ChildToMixin);

    var child = new Child();
  });
  test('3.3.1.2 Instance shares same context with mixin', function() {
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

  test('3.3.2 Ctor passes the mixin', function() {
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
  test('3.3.3 mixin accepts an array of ctors', function() {
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
  test('3.3.3.2 mixin invokes ctors in the right order', function() {
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

  test('3.3.3.2.1 Complex Mixin Constructors are invoked in the expected order', function() {
    var spyOne = sinon.spy();
    var spyTwo = sinon.spy();
    var spyThree = sinon.spy();
    var spyFour = sinon.spy();
    var spyFive = sinon.spy();
    var spyMixinOne = sinon.spy();
    var spyMixinTwo = sinon.spy();
    var spyMixinThree = sinon.spy();
    var spyMixinFour = sinon.spy();
    var spyMixinFive = sinon.spy();


    var Mixin = inher.extend(spyMixinOne);
    var MixinTwo = inher.extend(spyMixinTwo);
    var MixinThree = inher.extend(spyMixinThree);
    var MixinFour = inher.extend(spyMixinFour);
    var MixinFive = inher.extend(spyMixinFive);

    var Child = inher.extend(spyOne);
    Child.mixin(Mixin);
    
    var GrandChild = Child.extend(spyTwo);
    GrandChild.mixin(MixinTwo, MixinThree);

    var GreatGrandChild = GrandChild.extend(spyThree);

    var GreatGreatGrandChild = GreatGrandChild.extend(spyFour);
    GreatGreatGrandChild.mixin([MixinFour, MixinFive]);

    var GreatGreatGreatGrandChild = GreatGreatGrandChild.extend(spyFive);


    GreatGreatGreatGrandChild.getInstance();

    assert.ok(spyMixinOne.calledBefore(spyOne), 'Mixin() before Child()');
    assert.ok(spyOne.calledBefore(spyMixinTwo), 'Child() before MixinTwo()');
    assert.ok(spyMixinTwo.calledBefore(spyMixinThree), 'MixinTwo() before MixinThree()');
    assert.ok(spyMixinThree.calledBefore(spyTwo), 'spyMixinThree() before GrandChild()');
    assert.ok(spyTwo.calledBefore(spyThree), 'GrandChild() called before GreatGrandChild()');
    assert.ok(spyThree.calledBefore(spyMixinFour), 'GreatGrandChild() called before MixinFour()');
    assert.ok(spyMixinFour.calledBefore(spyMixinFive), 'MixinFour() called before MixinFive()');
    assert.ok(spyMixinFive.calledBefore(spyFour), 'MixinFive() called before GreatGreatGrandChild()');
    assert.ok(spyFour.calledBefore(spyFive), 'GreatGreatGrandChild called before GreatGreatGreatGrandChild');
  });


  test('3.3.3.3 mixin ctors share the same context', function() {
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
  test('3.3.4 mixin accepts comma separated ctors', function() {
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
  test('3.3.5 We can interact with the Mixin this object', function() {
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


  test('3.3.10 Mixin prototype methods get passed down the chain', function() {
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
