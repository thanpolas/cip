/*jshint camelcase:false */
/**
 * @fileOverview CIP Wrapper.
 */

var Cip = require('./base');
var Store = require('./store');
var helpers = require('./helpers');

var wrapper = module.exports = {};

/**
 * The API exposed static function
 *
 * @param {Function} Ctor The Constructor to augment.
 * @return {Function} The Ctor augmented but not required, passed Ctor gets
 *   mutated anyway.
 */
wrapper.wrap = function(Ctor) {
  /** @constructor */
  function Clone() {
    Ctor.apply(this, arguments);
  }
  helpers.inherit(Clone, Ctor);

  return wrapper._wrapActual(Clone);
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
wrapper._wrapActual = function(Ctor, optParentCtor, optStubbedArgs, optChildCtor) {
  if (Cip.is(Ctor)) {
    return Ctor;
  }

  // partially apply extend to singleton instance
  Ctor.extend = Cip.extend;
  Ctor.mixin = Cip.mixin;
  Ctor.getInstance = Cip.getInstance;
  Ctor[Cip.KEY] = new Store();

  if (Array.isArray(optStubbedArgs)) {
    Ctor[Cip.KEY].stubbedArgs = optStubbedArgs;
  }

  if (typeof optChildCtor === 'function') {
    Ctor[Cip.KEY].UserCtor = optChildCtor;
  }

  return Ctor;
};


