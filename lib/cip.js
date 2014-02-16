/**
 * @fileOverview CIP Classical Inheritance Pattern, the bootstrap module.
 * @author Thanasis Polychronakis 2014
 */

// Compose cip
var Cip = require('./base');
Cip.extend = require('./extend').extend;
Cip.mixin = require('./mixin').mixin;
Cip.extendSingleton = require('./singleton').extendSingleton;
Cip.wrap = require('./wrapper').wrap;
