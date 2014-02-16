/*jshint unused:false */
/*jshint camelcase:false */

/**
 * @fileOverview Classical Inherritance Helper
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
var Inher = module.exports = function() {};

/** @const {string} Inher's private property */
Inher.KEY = '_inher';

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
 * @param {Function|Object} self the context of the invoked Ctor.
 * @return {Function} a function to use as Parent Constructor.
 */
function getParentCtor(self) {
  if (self === global) {
    return Inher;
  } else {
    return self;
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
 * @return {Inher} The singleton instance for the provided Ctor.
 */
Inher.getInstance = function() {
  var Ctor = getParentCtor(this);
  if (Ctor[Inher.KEY].singleton) {
    return Ctor[Inher.KEY].singleton;
  }
  var singleton = new Ctor();
  Ctor[Inher.KEY].singleton = singleton;
  return singleton;
};


/**
 * The API exposed static function
 *
 * @param {Function} Ctor The Constructor to augment.
 * @return {Function} The Ctor augmented but not required, passed Ctor gets
 *   mutated anyway.
 */
Inher.wrap = function(Ctor) {
  /** @constructor */
  function Clone() {
    Ctor.apply(this, arguments);
  }
  helpers.inherit(Clone, Ctor);

  return Inher._wrapActual(Clone);
};

/**
 * The actual Wrapping implementation, augments the constructor with
 * static helper functions, references and Inher's private store.
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
Inher._wrapActual = function(Ctor, optParentCtor, optStubbedArgs, optChildCtor) {
  if (Inher.isInher(Ctor)) {
    return Ctor;
  }

  // partially apply extend to singleton instance
  Ctor.extend = Inher.extend;
  Ctor.mixin = Inher.mixin;
  Ctor.getInstance = Inher.getInstance;
  if (typeof optParentCtor === 'function') {
    Ctor.super_ = optParentCtor;
  }
  Ctor[Inher.KEY] = new Store();

  if (Array.isArray(optStubbedArgs)) {
    Ctor[Inher.KEY].stubbedArgs = optStubbedArgs;
  }

  if (typeof optChildCtor === 'function') {
    Ctor[Inher.KEY].UserCtor = optChildCtor;
  }

  return Ctor;
};


/**
 * Mixin implementation.
 *
 * @param {...Function|...Inhe||Array.<Function>} args any combination of
 *   constructors to mixin, check documentation.
 * @return {void}
 */
Inher.mixin = function() {
  var Ctor = getParentCtor(this);
  var args = Array.prototype.slice.call(arguments);
  var mixinCtors = [];

  args.forEach(function(arg) {
    if (typeof(arg) === 'function') {
      mixinCtors.push(arg);
    } else if (Array.isArray(arg)) {
      mixinCtors = mixinCtors.concat(arg);
    } else {
      throw new TypeError('Mixin arguments not of right type');
    }
  });

  mixinCtors.forEach(function(MixinCtor) {
    helpers.assign(Ctor.prototype, MixinCtor.prototype);
    Ctor[Inher.KEY].mixins.push(MixinCtor);
  });
};

/**
 * The API extend, normalizes arguments and invoked actual extend.
 *
 * @param {...*} args Any type and number of arguments, view docs.
 * @return {Function} A child constructor.
 */
Inher.extend = function() {
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

    var parentArgs = calculateParentArgs(ParentCtor[Inher.KEY].UserCtor.length,
      args, ctorArgs);

    // invoke parent ctor
    ParentCtor.apply(this, parentArgs);

    // invoke all mixins
    var self = this;
    Ctor[Inher.KEY].mixins.forEach(function(Mixin) {
      Mixin.apply(self, parentArgs);
    });

    ChildCtor.apply(this, ctorArgs);
  }
  helpers.inherit(Ctor, ParentCtor);

  Inher._wrapActual(Ctor, ParentCtor, args, ChildCtor);

  return Ctor;
};

/**
 * Helper storage for inher
 * @type {Object}
 * @private
 */
Inher[Inher.KEY] = new Store('base');

/**
 * Check if a Ctor is of Inher origin.
 *
 * @param {Function} Ctor the constructor to examine.
 * @return {boolean} yes / no.
 */
Inher.isInher = function(Ctor) {
  if (!Ctor[Inher.KEY]) {
    return false;
  }

  if (!Array.isArray(Ctor[Inher.KEY].mixins)) {
    return false;
  }

  if (typeof Ctor[Inher.KEY].id !== 'string') {
    return false;
  }

  if (typeof Ctor.extend !== 'function') {
    return false;
  }

  if (typeof Ctor.getInstance !== 'function') {
    return false;
  }

  if (typeof Ctor.mixin !== 'function') {
    return false;
  }

  return true;
};
