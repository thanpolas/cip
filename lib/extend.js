/**
 * @fileOverview CIP extend implementation.
 */

var Cip = require('./base');
var helpers = require('./helpers');

var extend = module.exports = {};


/**
 * The API extend, normalizes arguments and invoked actual extend.
 *
 * @param {...*} args Any type and number of arguments, view docs.
 * @return {Function} A child constructor.
 */
extend.extend = function() {
  var args = Array.prototype.slice.call(arguments);

  // heuristics to determine child ctor and if this is a chained extend or not
  var ParentCtor = helpers.getParentCtor(this);
  var ChildCtor = helpers.getChildCtor(args);

  //
  // Inheritance
  //
  /** @constructor */

  // Create Constructor
  function Ctor() {
    var ctorArgs = Array.prototype.slice.call(arguments);

    var parentArgs = helpers.calculateParentArgs(
      ParentCtor[Cip.KEY].UserCtor.length,
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
