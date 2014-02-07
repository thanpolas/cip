/*jshint unused:false */
/*jshint camelcase:false */

/**
 * @fileOverview Mixin implementation
 */

var util = require('util');

/**
 * Mixin method.
 *
 * @param {Inhe} Ctor ctor to mixin onto.
 * @param {...Function|...Inhe||Array.<Function>} args any combination of
 *   constructors to mixin, check documentation.
 * @return {void}
 */
module.exports = function mixin(Ctor) {
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
    assign(Ctor.prototype, MixinCtor.prototype);
    Ctor._inhe.mixins.push(MixinCtor);
  });
};