/**
 * Coolback
 */

if(typeof setImmediate !== 'function' || typeof setTimeout !== 'function') {
 // Browser
 module.exports = require('./sync');
} else {
 module.exports = require('../export')((typeof setImmediate === 'function' ? setImmediate : function(fn) { setTimeout(fn, 0);}));
}
