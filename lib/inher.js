/*jshint unused:false */
/*jshint camelcase:false */

/**
 * @fileOverview Pseudoclassical Inherritance Helper
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
 * Extention static function
 *
 * @param {number} arity The arity of the user defined ctor function.
 * @param {Array} extendArgs Arguments passed to extend that will stub the
 *   parent's constructor arguments.
 * @param {Array} ctorArgs Arguments passed while instanciating the child ctor.
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
 * Determine the parent constructor based on arguments passed to extend().
 *
 * @param {Array} args arguments Warning: Mutates passed array by design.
 * @return {Inher} a function.
 */
function getParentCtor(args) {
  if (args.length && Inher.isInher(args[0])) {
    return args.shift();
  } else {
    return Inher;
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
 * @param {Inher} ParentCtor Inher inherited Ctor.
 * @param {...*} Any number of any type args.
 * @return {Inher} The singleton instance for the provided Ctor.
 */
Inher.getInstance = function(ParentCtor) {
  if (ParentCtor[Inher.KEY].singleton) {
    return ParentCtor[Inher.KEY].singleton;
  }
  var args = Array.prototype.slice.call(arguments, 1);
  var singleton = Object.create(ParentCtor.prototype);
  singleton.constructor = ParentCtor;
  ParentCtor.apply(singleton, args);
  ParentCtor[Inher.KEY].singleton = singleton;
  return singleton;
};


/**
 * Augments the constructor with static helper functions, references
 * and Inher's private store.
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
Inher.wrap = function(Ctor, optParentCtor, optStubbedArgs, optChildCtor) {
  // partially apply extend to singleton instance
  Ctor.extend = Inher.extend.bind(null, Ctor);
  Ctor.mixin = Inher.mixin.bind(null, Ctor);
  Ctor.getInstance = Inher.getInstance.bind(null, Ctor);
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
 * @param {Inhe} Ctor ctor to mixin onto.
 * @param {...Function|...Inhe||Array.<Function>} args any combination of
 *   constructors to mixin, check documentation.
 * @return {void}
 */
Inher.mixin = function(Ctor) {
  var args = Array.prototype.slice.call(arguments, 1);
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
  var ParentCtor = getParentCtor(args);
  var ChildCtor = getChildCtor(args);

  //
  // Inherritance
  //
  /** @constructor */
  function TempCtor() {}
  TempCtor.prototype = ParentCtor.prototype;

  // Create Constructor
  function Ctor() {
    var ctorArgs = Array.prototype.slice.call(arguments);

    var parentArgs = calculateParentArgs(ParentCtor[Inher.KEY].UserCtor.length,
      args, ctorArgs);

    // invoke parent ctor
    ParentCtor.apply(this, parentArgs);

    // invoke all mixins
    Ctor[Inher.KEY].mixins.forEach(function(Mixin) {
      Mixin.apply(this, parentArgs);
    }.bind(this));

    ChildCtor.apply(this, ctorArgs);
  }
  Ctor.prototype = new TempCtor();

  Inher.wrap(Ctor, ParentCtor, args, ChildCtor);

  return Ctor;
};

/**
 * Helper storage for inhe
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
  return true;
};
