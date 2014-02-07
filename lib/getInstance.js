/**
 * @fileOverview getInstance implementation.
 */

/**
 * Returns a singleton instance of the provided Ctor.
 *
 * @param {Inher} ParentCtor Inher inherited Ctor.
 * @param {...*} Any number of any type args.
 * @return {Inher} The singleton instance for the provided Ctor.
 */
module.exports = function getInstance(ParentCtor) {
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
