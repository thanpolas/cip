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
 * @param {Function} ParentCtor The parent constructor.
 * @param {Array} extendArgs Arguments passed to extend that will stub the
 *   parent's constructor arguments.
 * @param {Array} ctorArgs Arguments passed while instanciating the child ctor.
 * @return {Array} An array with the proper arguments to pass to ParentCtor.
 * @static
 */
function calculateParentArgs(ParentCtor, extendArgs, ctorArgs) {
  var extendArgsLen = extendArgs.length;

  if (extendArgsLen === 0) {
    return ctorArgs;
  }

  // check if extendArgs are enough for parent
  var parentCtorArity = ParentCtor.length;
  if (parentCtorArity <= extendArgsLen) {
    return extendArgs;
  }

  var borrowArgsFromCtor = ctorArgs.slice(0, parentCtorArity - extendArgsLen);

  return extendArgs.concat(borrowArgsFromCtor);
}

/**
 * Determine the parent constructor based on arguments passed to extend().
 *
 * @param {Array} args arguments Warning: Mutates passed array by design.
 * @return {Inhe} a function.
 */
function getParentCtor(args) {
  if (args.length && args[0]._isInhe) {
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
 * Mixin method.
 *
 * @param {Inhe} ParentCtor ctor to mixin onto.
 * @param {...Function|...Inhe||Array.<Function>} args any combination of
 *   constructors to mixin, check documentation.
 * @return {void}
 */
Inhe.mixin = function(ParentCtor) {
  var args = Array.prototype.slice.call(arguments, 1);
  var mixinCtors = [];

  args.forEach(function(arg) {
    if (typeof(arg) === 'function') {
      mixinCtors.push(arg);
    } else if (Array.isArray(arg)) {
      mixinCtors.concat(arg);
    } else {
      throw new TypeError('Mixin arguments not of right type');
    }
  });

  mixinCtors.forEach(function(MixinCtor) {
    assign(ParentCtor.prototype, MixinCtor.prototype);
    ParentCtor._mixins.push(MixinCtor);
  });
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
  ChildCtor.prototype = new TempCtor();

  // override constructor
  ChildCtor.prototype.constructor = function() {
    var ctorArgs = Array.prototype.slice.call(arguments, 0);
    var parentArgs = calculateParentArgs(ParentCtor, args, ctorArgs);
    ParentCtor.apply(this, parentArgs);

    ParentCtor._mixins.forEach(function(Mixin) {
      Mixin.apply(this, parentArgs);
    });

    ChildCtor.apply(this, arguments);
  };

  // partially apply extend to singleton instance
  ChildCtor.extend = Inhe.extend.bind(null, ChildCtor);
  ChildCtor.mixin = Inhe.mixin.bind(null, ChildCtor);
  ChildCtor.getInstance = Inhe.getInstance.bind(null, ChildCtor);
  ChildCtor._isInhe = true;
  ChildCtor._mixins = Array.prototype.slice.call(ParentCtor._mixins, 0);

  return ChildCtor;
};

/**
 * Store for Mixin constructors, FIFO.
 * @type {Array}
 * @private
 */
Inhe._mixins = [];

/**
 * Indicates Inhe origin.
 * @type {boolean}
 * @private
 */
Inhe._isInhe = true;
