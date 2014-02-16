/*jshint unused:false */
/*jshint camelcase:false */

/**
 * @fileOverview CIP Classical Inheritance Pattern
 * @author Thanasis Polychronakis 2014
 */

var util = require('util');

var helpers = require('./helpers');
var Store = require('./store');

var noop = function(){};

/**
 * The base constructor.
 *
 * @constructor
 */
var Cip = module.exports = function() {};

/** @const {string} Cip's private property */
Cip.KEY = '_Cip';

/**
 * Extension static function
 *
 * @param {number} arity The arity of the user defined ctor function.
 * @param {Array} extendArgs Arguments passed to extend that will stub the
 *   parent's constructor arguments.
 * @param {Array} ctorArgs Arguments passed while instantiating the child ctor.
 * @return {Array} An array with the proper arguments to pass to ParentCtor.
 * @static
 */
function calculateParentArgs(arity, extendArgs, ctorArgs) {
  var extendArgsLen = extendArgs.length;

  if (extendArgsLen === 0) {
    return ctorArgs;
  }

  // check if extendArgs are enough for parent
  if (arity <= extendArgsLen) {
    return extendArgs;
  }

  var borrowArgsFromCtor = ctorArgs.slice(0, arity - extendArgsLen);

  return extendArgs.concat(borrowArgsFromCtor);
}

/**
 * Determine the parent constructor based on retained context.
 *
 * @param {Function|Object} Ctor The context of the invoked static helper,
 *   extend(), mixin() and getInstance(), should be the Ctor.
 * @return {Function} a function to use as Parent Constructor.
 */
function getParentCtor(Ctor) {
  if (!Cip.is(Ctor)) {
    return Cip;
  } else {
    return Ctor;
  }
}

/**
 * Determine the Child constructor based on arguments passed to extend().
 *
 * @param {Array} args arguments Warning: Mutates passed array by design.
 * @return {Function} a ctor.
 */
function getChildCtor(args) {
  var argsLen = args.length;
  if (argsLen) {
    if (typeof(args[argsLen -1]) === 'function') {
      return args.pop();
    } else {
      return noop;
    }
  } else {
    return noop;
  }
}

/**
 * Returns a singleton instance of the provided Ctor.
 *
 * @return {Cip} The singleton instance for the provided Ctor.
 */
Cip.getInstance = function() {
  var Ctor = getParentCtor(this);
  if (Ctor[Cip.KEY].singleton) {
    return Ctor[Cip.KEY].singleton;
  }
  var singleton = new Ctor();
  Ctor[Cip.KEY].singleton = singleton;
  return singleton;
};


/**
 * The API exposed static function
 *
 * @param {Function} Ctor The Constructor to augment.
 * @return {Function} The Ctor augmented but not required, passed Ctor gets
 *   mutated anyway.
 */
Cip.wrap = function(Ctor) {
  /** @constructor */
  function Clone() {
    Ctor.apply(this, arguments);
  }
  helpers.inherit(Clone, Ctor);

  return Cip._wrapActual(Clone);
};

/**
 * The actual Wrapping implementation, augments the constructor with
 * static helper functions, references and Cip's private store.
 *
 * @param {Function} Ctor The Constructor to augment, WARNING function gets
 *   mutated by design.
 * @param {Function=} optParentCtor If defined the Parent ctor will be assigned
 *   in the "super_" property.
 * @param {Array=} optStubbedArgs An array of arguments to stub the Ctor with.
 * @param {Function=} optChildCtor Optionally define the actual child ctor
 *   if it exists (used internally by extend()).
 * @return {Function} The Ctor augmented but not required, passed Ctor gets
 *   mutated anyway.
 */
Cip._wrapActual = function(Ctor, optParentCtor, optStubbedArgs, optChildCtor) {
  if (Cip.is(Ctor)) {
    return Ctor;
  }

  // partially apply extend to singleton instance
  Ctor.extend = Cip.extend;
  Ctor.mixin = Cip.mixin;
  Ctor.getInstance = Cip.getInstance;
  if (typeof optParentCtor === 'function') {
    Ctor.super_ = optParentCtor;
  }
  Ctor[Cip.KEY] = new Store();

  if (Array.isArray(optStubbedArgs)) {
    Ctor[Cip.KEY].stubbedArgs = optStubbedArgs;
  }

  if (typeof optChildCtor === 'function') {
    Ctor[Cip.KEY].UserCtor = optChildCtor;
  }

  return Ctor;
};


/**
 * Mixin implementation.
 *
 * @param {...Function|...Cip} args any number of args with Ctors to Mixin.
 */
Cip.mixin = function() {
  var Ctor = getParentCtor(this);
  var mixinCtors = Array.prototype.slice.call(arguments);

  mixinCtors.forEach(function(MixinCtor) {
    Ctor[Cip.KEY].mixins.push(MixinCtor);
    helpers.assign(Ctor.prototype, MixinCtor.prototype);
  });
};

/**
 * The API extend, normalizes arguments and invoked actual extend.
 *
 * @param {...*} args Any type and number of arguments, view docs.
 * @return {Function} A child constructor.
 */
Cip.extend = function() {
  var args = Array.prototype.slice.call(arguments);

  // heuristics to determine child ctor and if this is a chained extend or not
  var ParentCtor = getParentCtor(this);
  var ChildCtor = getChildCtor(args);

  //
  // Inheritance
  //
  /** @constructor */

  // Create Constructor
  function Ctor() {
    var ctorArgs = Array.prototype.slice.call(arguments);

    var parentArgs = calculateParentArgs(ParentCtor[Cip.KEY].UserCtor.length,
      args, ctorArgs);

    // invoke parent ctor
    ParentCtor.apply(this, parentArgs);

    // invoke all mixins
    var self = this;
    Ctor[Cip.KEY].mixins.forEach(function(Mixin) {
      Mixin.apply(self, parentArgs);
    });

    ChildCtor.apply(this, ctorArgs);
  }
  helpers.inherit(Ctor, ParentCtor);

  Cip._wrapActual(Ctor, ParentCtor, args, ChildCtor);
  return Ctor;
};

/**
 * Helper storage for Cip
 * @type {Object}
 * @private
 */
Cip[Cip.KEY] = new Store('base');

/**
 * Check if a Ctor is of Cip origin.
 *
 * @param {Function} Ctor the constructor to examine.
 * @return {boolean} yes / no.
 */
Cip.is = function(Ctor) {
  return !!Ctor[Cip.KEY];
};
