/**
 * Coolback
 *
 *
 */

var _process = require('./process');
var _io = require('./io');
var _sync = require('./sync');
var _fns = Object.keys(_process);

// Set the io first version
module.exports.io = _io;
// Using process.nextTick
module.exports.process = _process;
// Fake async
module.exports.sync = _sync;
// Set the default functions Default
for(var i=0;i<_fns.length;++i) {
   module.exports[_fns[i]] = _process[_fns[i]];
}
