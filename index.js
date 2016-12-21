/**
 * Coolback
 *
 *
 */

var _process = require('./types/process');
var _io = require('./types/io');
var _sync = require('./types/sync');
var _random = require('./types/random');
var _fns = Object.keys(_process);

// Using timers
module.exports.io = _io;
// Using process.nextTick
module.exports.process = _process;
// Fake async
module.exports.sync = _sync;
// Randomly using one of the others
module.exports.random = _random;

// Set the default functions Default
for(var i=0;i<_fns.length;++i) {
   module.exports[_fns[i]] = _process[_fns[i]];
}
