/**
 * @fileOverview Singleton Pattern.
 */

var Cip = require('./base');
var helpers = require('./helpers');

var sing = module.exports = {};

sing.extendSingleton = function() {

};

/**
 * Returns a singleton instance of the provided Ctor.
 *
 * @return {Cip} The singleton instance for the provided Ctor.
 */
sing.getInstance = function() {
  var Ctor = helpers.getParentCtor(this);
  if (Ctor[Cip.KEY].singleton) {
    return Ctor[Cip.KEY].singleton;
  }
  var singleton = new Ctor();
  Ctor[Cip.KEY].singleton = singleton;
  return singleton;
};

