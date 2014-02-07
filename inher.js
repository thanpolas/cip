/*jshint unused:false */
/*jshint camelcase:false */

/**
 * @fileOverview Pseudoclassical Inheritance Helper
 * @author Thanasis Polychronakis 2014
 */

var util = require('util');

/**
 * The base constructor.
 *
 * @constructor
 */
var Inhe = module.exports = function() {};

var noop = function(){};

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
 * @return {Inhe} a function.
 */
function getParentCtor(args) {
  if (args.length && args[0]._inhe) {
    return args.shift();
  } else {
    return Inhe;
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
 * A simple implementation to clone objects
 *
 * @param {Object} dest Target Object
 * @param {Object} source Source Object
 */
function assign(dest, source) {
  for (var key in source) {
    dest[key] = source[key];
  }
}

/**
 * Generate a random string.
 *
 * @param  {number=} optLength How long the string should be, default 8.
 * @return {string} a random string.
 */
function generateRandomString(optLength) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var length = optLength || 8;
  var string = '';
  var randomNumber = 0;
  for (var i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNumber, randomNumber + 1);
  }
  return string;
}

/**
 * Returns a singleton instance of the provided Ctor.
 *
 * @param {Inhe} ParentCtor Inhe inherited Ctor.
 * @param {...*} Any number of any type args.
 * @return {Inhe} The singleton instance for the provided Ctor.
 */
Inhe.getInstance = function (ParentCtor) {
  if (ParentCtor._inhe.singleton) {
    return ParentCtor._inhe.singleton;
  }
  var args = Array.prototype.slice.call(arguments, 1);
  var singleton = Object.create(ParentCtor.prototype);
  singleton.constructor = ParentCtor;
  ParentCtor.apply(singleton, args);
  ParentCtor._inhe.singleton = singleton;
  return singleton;
};

/**
 * The API extend, normalizes arguments and invoked actual extend.
 *
 * @param {...*} args Any type and number of arguments, view docs.
 * @return {Function} A child constructor.
 */
Inhe.extend = function() {

  var args = Array.prototype.slice.call(arguments, 0);

  // heuristics to determine child ctor and if this is a chained extend or not
  var ParentCtor = getParentCtor(args);
  var ChildCtor = getChildCtor(args);

  //
  // Inheritance
  //
  /** @constructor */
  function TempCtor() {}
  TempCtor.prototype = ParentCtor.prototype;

  // Create Constructor
  function Ctor() {
    var ctorArgs = Array.prototype.slice.call(arguments, 0);

    var parentArgs = calculateParentArgs(ParentCtor._inhe.UserCtor.length,
      args, ctorArgs);

    // invoke parent ctor
    ParentCtor.apply(this, parentArgs);

    // invoke all mixins
    Ctor._inhe.mixins.forEach(function(Mixin) {
      Mixin.apply(this, parentArgs);
    }.bind(this));

    ChildCtor.apply(this, ctorArgs);
  }
  Ctor.prototype = new TempCtor();



  // partially apply extend to singleton instance
  Ctor.extend = Inhe.extend.bind(null, Ctor);
  Ctor.mixin = Inhe.mixin.bind(null, Ctor);
  Ctor.getInstance = Inhe.getInstance.bind(null, Ctor);
  Ctor.super_ = ParentCtor;
  Ctor._inhe = {
    mixins: [],
    singleton: null,
    stubbedArgs: args,
    id: generateRandomString(),
    UserCtor: ChildCtor,
  };

  return Ctor;
};

/**
 * Helper storage for inhe
 * @type {Object}
 * @private
 */
Inhe._inhe = {
  /** @type {Array} Store for Mixin constructors, FIFO. */
  mixins: [],
  /** @type {?Inhe} Container for singleton instance.. */
  singleton: null,
  /** @type {Array} Contains the stubbed arguments */
  stubbedArgs: [],
  /** @type {string} A unique identifier */
  id: 'base',
  /** @type {?Function} The user defined ctor */
  UserCtor: noop,
};

