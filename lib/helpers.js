/**
 * @fileOverview Utility helpers.
 */

var helpers = module.exports = {};

/**
 * A simple implementation to clone objects
 *
 * @param {Object} dest Target Object
 * @param {Object} source Source Object
 */
helpers.assign = function assign(dest, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      dest[key] = source[key];
    }
  }
};

/**
 * Generate a random string.
 *
 * @param  {number=} optLength How long the string should be, default 8.
 * @return {string} a random string.
 */
helpers.generateRandomString = function generateRandomString(optLength) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var length = optLength || 8;
  var string = '';
  var randomNumber = 0;
  for (var i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNumber, randomNumber + 1);
  }
  return string;
};

/**
 * Apply an array of arguments to a new instance.
 *
 * @param {Function} Ctor The constructor to instanciate.
 * @param {...*} Any number of any type args.
 * @return {Object} An instance of Ctor.
 */
helpers.applyArgsToCtor = function(Ctor) {
  var args = Array.prototype.slice.call(arguments, 1);
  var instance = Object.create(Ctor.prototype);
  instance.constructor = Ctor;
  Ctor.apply(instance, args);
  return instance;
};

/**
 * Object.create() Prototypical Inheritance.
 *
 * @param {Function} ChildCtor The Child Ctor.
 * @param {Function} ParentCtor The Parent Ctor.
 */
helpers.inherit = function(ChildCtor, ParentCtor) {
  ChildCtor.prototype = Object.create(ParentCtor.prototype);
  ChildCtor.prototype.constructor = ParentCtor;
};

/**
 * Partially apply arguments to a function.
 *
 * @param {Function} fn The function.
 * @param {...*} Any number of arguments of any type to apply.
 * @return {Function} The function with the arguments partially applied.
 */
helpers.partial = function(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var callArgs = Array.prototype.slice.call(arguments);
    fn.apply(null, args.concat(callArgs));
  };
};
