/*jshint unused:false */
/*jshint camelcase:false */

/**
 * @fileOverview Pseudoclassical Inherritance Helper
 * @author Thanasis Polychronakis 2014
 */

var util = require('util');

var helpers = require('./helpers');
var mixin = require('./mixin');
var getInstance = require('./getInstance');
var Store = require('./store');

var noop = function(){};

/**
 * The base constructor.
 *
 * @constructor
 */
var Inher = module.exports = function() {};
// Expose API
Inher.mixin = mixin;
Inher.getInstance = getInstance;

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
 * Augments the constructor with static helper functions, references
 * and Inher's private store.
 *
 * @param {Function} Ctor The Constructor to augment, WARNING function gets
 *   mutated by design.
 * @param {Function=} optParentCtor If defined the Parent ctor will be assigned
 *   in the "super_" property.
 * @return {Function} The Ctor augmented but not required, passed Ctor gets
 *   mutated anyway.
 */
Inher.wrap = function(Ctor, optParentCtor) {
  // partially apply extend to singleton instance
  Ctor.extend = Inher.extend.bind(null, Ctor);
  Ctor.mixin = Inher.mixin.bind(null, Ctor);
  Ctor.getInstance = Inher.getInstance.bind(null, Ctor);
  if (typeof optParentCtor === 'function') {
    Ctor.super_ = optParentCtor;
  }
  Ctor[Inher.KEY] = new Store();
  return Ctor;
};

/**
 * The API extend, normalizes arguments and invoked actual extend.
 *
 * @param {...*} args Any type and number of arguments, view docs.
 * @return {Function} A child constructor.
 */
Inher.extend = function() {

  var args = Array.prototype.slice.call(arguments, 0);

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
    var ctorArgs = Array.prototype.slice.call(arguments, 0);

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

  Inher.wrap(Ctor, ParentCtor);

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

  if (typeof(id) !== 'string') {
    return false;
  }

  return true;
};
