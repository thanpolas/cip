/**
 * @fileOverview CIP Classical Inheritance Pattern
 * @author Thanasis Polychronakis 2014
 */
var Store = require('./store');

var noop = function(){};

/**
 * The base constructor.
 *
 * @constructor
 */
var Cip = module.exports = noop;

/** @const {string} Cip's private property */
Cip.KEY = '_cip';


/**
 * Helper storage for Cip
 * @type {Object}
 * @private
 */
Cip[Cip.KEY] = new Store('base');

/**
 * Check if a Ctor is of Cip origin.
 *
 * @param {Function} Ctor the constructor to examine.
 * @return {boolean} yes / no.
 */
Cip.is = function(Ctor) {
  return !!Ctor[Cip.KEY];
};
