/**
 * Coolback
 */

if(typeof process !== 'object' || process  === null || typeof process.nextTick !== 'function') {
   // Browser
   module.exports = require('./io');
} else {
   module.exports = require('../export')(process.nextTick);
}
