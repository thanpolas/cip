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
var Inhe = module.exports = function() {
};

/**
 * Extention static function
 *
 * @param {Function} cTor The constructor.
 * @param {Function=} optCtor When the arity of the function is 2 this cTor
 *   is the one that was passed by the invoker, thus is the child constructor.
 * @return {Entity} An entity Instance.
 * @static
 */
Inhe.extend = function(cTor, optCtor) {
  var ParentCtor;
  var ChildCtor;

  if (arguments.length === 2) {
    ChildCtor = optCtor;
    ParentCtor = cTor;
  } else {
    ChildCtor = cTor;
    ParentCtor = Inhe;
  }

  if (typeof ChildCtor !== 'function') {
    throw new TypeError('Child needs a constructor');
  }
  if (typeof ParentCtor !== 'function') {
    throw new TypeError('Parent needs a constructor');
  }

  /** @constructor */
  function TempCtor() {}
  TempCtor.prototype = ParentCtor.prototype;
  ChildCtor.prototype = new TempCtor();

  // override constructor
  ChildCtor.prototype.constructor = function() {
    ParentCtor.apply(this, arguments);
    ChildCtor.apply(this, arguments);
  };

  // create singleton
  var singleton = new ChildCtor();

  // partially apply extend to singleton instance
  singleton.extend = ParentCtor.extend.bind(null, ChildCtor);

  // reference prototype
  singleton.prototype = ChildCtor.prototype;

  return singleton;
};
