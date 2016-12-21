/**
 * Coolback
 * Randomly picks which type of nextTick to use
 */

var _types = [require('./process'), require('./io'), require('./sync')];
for(var key in _types[0]) {
  addToExport(key);
}

function addToExport(fn) {
  module.exports[fn] = function() {
    return _types[Math.floor(Math.random() * _types.length)][fn].apply(null, arguments);
  }
}
