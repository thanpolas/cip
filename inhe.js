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
 * The API extend, normalizes arguments and invoked actual extend.
 *
 * @param {...*} args Any type and number of arguments, view docs.
 * @return {Function} A child constructor.
 */
Inhe.extend = function() {
  var ChildCtor;
  var ParentCtor;

  var args = Array.prototype.slice.call(arguments, 0);
  var argsLen = args.length;

  if (argsLen) {
    if (typeof(args[argsLen -1]) === 'function') {
      ChildCtor = args.pop();
    } else {
      ChildCtor = noop;
    }
  } else {
    ChildCtor = noop;
  }

  // leverage js to determine parent constructor
  if (ChildCtor.prototype.constructor === ChildCtor) {
    ParentCtor = Inhe;
  } else {
    ParentCtor = ChildCtor.prototype.constructor;
  }

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
    ChildCtor.apply(this, arguments);
  };

  // partially apply extend to singleton instance
  ChildCtor.extend = Inhe.extend;

  ParentCtor.extend.bind(null, ChildCtor);

  // create singleton
  var singleton = new ChildCtor();


  // reference prototype
  singleton.prototype = ChildCtor.prototype;

  return singleton;


};
