/**
 * Coolback
 *
 *
 */

// setImmediate or setTimeout wrapper based on what is at hand
var _setImmediate = (typeof setImmediate === 'function' && setImmediate ? function(fn) { setImmediate(fn);} : function(fn) { setTimeout(fn, 0);});
// Set the nextTick function, default is process.nextTick, but may use timers instead
var _nextTick = (typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : _setImmediate);
var _isArray = Array.isArray || function(obj) {return (obj.toString()=== '[object Array]' ? true : false);};

/**
 * Is it really an error?
 */
function _isError(err) {
   return (typeof err === 'object' && err !== null && typeof err.message !== 'undefined' ? true : false);
}

/**
 * Merges the 2 parameters into an array
 */
function _arrayConcat(a, b) {
   return (_isArray(a) === true ? a : [a]).concat((_isArray(b) === true ? b : [b]));
}

/**
 * Removes the specified properties from the specifed object
 */
function _clearArgs(args, rem) {
  if(typeof args !== 'object' || args === null) {
    return args;
  }
  rem = (_isArray(rem) === true ? rem : (typeof rem === 'number' ? [rem] : []));
  return [].slice.call(args).filter(function(v, i, array) {
    // Ignore the callback
    return (rem.indexOf(i) === -1 ? true : false);
  });
}

/**
 * Common error handler
 */
function _error(err, cb) {
   try {
      if(typeof cb === 'function') {
         return cb(err);
      }
      if(_isError(err) === true) {
         throw err
      }
      return
   } catch(err) {
      throw err
   }
}

/**
 * Handles callback functions in a standard async way
 * The first 2 parameters must always be present, after that any number of parameters may be passed.
 * The function will call the specified callback function with err as the first parameter, then any of the additional
 * parameters passed in the same order as they were passed in
 *
 * coolback.eventLoop(callback, null, 'hello world');
 * coolback.eventLoop(callback, null, 'hello world', 'Chuck');
 * coolback.eventLoop(callback, new Error('Something happened'));
 *
 * @param cb {Function} The callback
 * @param {various} Any number of parameters may be added after the Callback
 *                  It is expected that err would be the first optional parameter
 */
function eventLoop() {
   try {
      // All ok?
      if(arguments.length <= 0 || typeof arguments[0] !== 'function') {
         throw new Error('Incorrect parameters supplied to eventLoop');
      }
      // Get the callback
      var cb = arguments[0];
      // Populate the arguments to send
      var args = _clearArgs(arguments, [0]);
      // Callback
      return _nextTick(
         function() {
            return cb.apply(null, args);
         }
      );
   } catch(err) {
      // Oh no
      return _error(err, cb);
   }
}

/**
 * For wrapping SYNC coded functions
 * Any value that is returned from the function is passed to the Callback
 * Return an array of values to populate multiple variables in the Callback
 * NULL is passed as the Error to the callback if the result from the function is NOT an Error
 * do not return an error as the first element of an error as the callback will received (null, err)
 *
 * @param fn {Function} The function to wrap
 */
function wrap(fn) {
   try {
      if(typeof fn !== 'function') {
         throw new Error('Incorrect parameters supplied to wrap');
      }
      var wrapped = function() {
         if(typeof arguments[arguments.length - 1] !== 'function') {
            throw new Error('Incorrect parameters supplied to ' + fn.name);
         }
         var cbi = arguments.length - 1;
         var cb = arguments[cbi];
         var res = undefined;
         try {
            res = fn.apply(null, _clearArgs(arguments, [cbi]));
         } catch(err) {
            res = err;
         }
         return eventLoop.apply(null, _arrayConcat(cb, _arrayConcat((_isError(res) === true ? [] : null), res)));
      }
      wrapped._wrappedFn = fn;
      return wrapped;
   } catch(err) {
      // Callback
      return _error(err, (typeof cb === 'undefined' ? undefined : cb));
   }
}

/**
 *
 */
function unwrap(fn) {
   try {
      if(typeof fn !== 'function') {
         throw new Error('Incorrect parameters supplied to unwrap');
      }
      return (typeof fn._wrappedFn !== 'undefined' ? fn._wrappedFn : fn);
   } catch(err) {
      return _error(err);
   }
}

/**
 * Loops through an object/array
 * Calling the specifed function for each key
 * Calls callback (optional) once finished
 */
function each(obj, fn, cb) {
   try {
      if(typeof obj !== 'object' || obj === null || typeof fn !== 'function' || typeof cb !== 'function') {
         throw new Error('Incorrect parameters supplied to each');
      }
      if(Object.keys(obj).length === 0) {
        // Nothing to process
        return nextTick(cb)(null);
      }
      return nextTick(_eachWild)(obj, Object.keys(obj), nextTick(fn), cb);
   } catch(err) {
      return _error(err, cb);
   }
}

/**
 *
 */
function eachInTurn(obj, fn, cb) {
  try {
    if(typeof obj !== 'object' || obj === null || typeof fn !== 'function' || typeof cb !== 'function') {
       throw new Error('Incorrect parameters supplied to eachInTurn');
    }
    if(Object.keys(obj).length === 0) {
      // Nothing to process
      return nextTick(cb)(null);
    }
    return nextTick(_eachControlled)(obj, Object.keys(obj), 0, nextTick(fn), cb);
  } catch(err) {
    return _error(err, cb);
  }
}

/**
 *
 */
function _eachWild(obj, keys, fn, cb) {
   try {
      var regexLimited = new RegExp(cb.name + '() called beyond maximum of 1');
      cbLimited = limit(cb, 1);
      var done = 0;
      var i = 0;
      while(Math.max(i, done)<keys.length) {
         fn(keys[i], obj[keys[i]], nextTick(function(err) {
            try {
               if(err || ++done === keys.length) {
                  done = keys.length;
                  return nextTick(cbLimited)((err ? err : null))
               }
            } catch(err) {
               done = keys.length;
               if(regexLimited.test(err.message) === false) {
                  // Not as a result of limit
                  return _error(err, cb);
               }
            }
         }));
         ++i;
      }
      return
   } catch(err) {
      return _error(err, cb);
   }
}

/**
 *
 */
function _eachControlled(obj, keys, i, fn, cb) {
   try {
      if(i > (keys.length - 1)) {
         // All done
         return nextTick(cb)(null);
      }
      return fn(keys[i], obj[keys[i]], nextTick(function(err) {
         if(err) {
            //Error so end early
            return cb(err);
         }
         // Keep the loop going
         return nextTick(_eachControlled)(obj, keys, ++i, fn, cb);
      }));
   } catch(err) {
      // Report the error
      return _error(err, cb);
   }
}

/**
 * Wrap the function in nextTick
 */
function nextTick(fn) {
   try {
      if(typeof fn !== 'function') {
         throw new Error('Incorrect parameters supplied to nextTick');
      }
      return function() {eventLoop.apply(null, _arrayConcat(fn, _clearArgs(arguments)));}
   } catch(err) {
      return _error(err);
   }
}

/**
 * Call the links of the chain in turn
 */
function chain(links, cb) {
   try {
      if(_isArray(links) === false || links.length === 0 || typeof cb !== 'function') {
         throw new Error('Incorrect parameters supplied to chain');
      }
      return nextTick(_chain)(links, 0, cb);
   } catch(err) {
      return _error(err, cb);
   }
}

/**
 *
 */
function _chain(links, i, cb) {
   try {
      if(i > (links.length - 1)) {
         // All done
         return eventLoop.apply(null, _arrayConcat([cb, null], _clearArgs(arguments, [0, 1, 2])));
      }
      return eventLoop.apply(null, _arrayConcat(links[i], _arrayConcat(_clearArgs(arguments, [0, 1, 2]), function(err) {
         if(err) {
           return nextTick(cb)(err);
         }
         return _chain.apply(null, _arrayConcat([links, ++i, cb], _clearArgs(arguments, [0])));
      })));
   } catch(err) {
      // Report the error
      return _error(err, cb);
   }
}

/**
 *
 */
function hook(fn, start, end) {
   try {
      if(typeof fn !== 'function' || (typeof start !== 'function' && typeof end !== 'function')) {
         throw new Error('Incorrect parameters supplied to hook');
      }
      var hooked = function() {
        return (typeof(arguments[arguments.length - 1]) === 'function' ? _hook : _hookSync)(fn, arguments, start, end);
      }
      hooked._hookedFn = fn;
      return hooked;
   } catch(err) {
      return _error(err);
   }
}

/**
 * ASYNC handler for hook
 */
function _hook(fn, args, start, end) {
  try {
    args = _clearArgs(args, []);
    var cb = args[args.length - 1];
    args.pop();
    return chain(
      [
        function(cb) {
          if(typeof start !== 'function') {
            return cb(null, args);
          }
          return start.apply(null, _arrayConcat(_clearArgs(args, []), cb));
        },
        function(args, cb) {
          if(typeof cb !== 'function') {
            return fn.apply(null, _arrayConcat(args, []));
          }
          return fn.apply(null, _arrayConcat(_arrayConcat(args, []), cb));
        },
        function(ret, cb) {
          if(typeof end !== 'function') {
            if(typeof cb !== 'function') {
              return ret(null);
            }
            return cb(null, ret);
          }
          if(typeof cb !== 'function') {
            return end.apply(null, _arrayConcat(ret, []));
          }
          return end.apply(null, _arrayConcat(ret, cb));
        }
      ], cb
    );
  } catch(err) {
    return _error(err, cb);
  }
}

/**
 * SYNC handler for hook
 */
function _hookSync(fn, args, start, end) {
  try {
    args = _clearArgs(args, []);
    var fnRet;
    if(typeof start === 'function') {
      args = start.apply(null, args);
    }
    fnRet = fn.apply(null, _arrayConcat(_clearArgs(args, []), []));
    if(typeof end === 'function') {
      return end.apply(null, _arrayConcat(_clearArgs(fnRet, []), []));
    }
    return fnRet;
  } catch(err) {
    return _error(err);
  }
}

/**
 *
 */
function unhook(fn) {
   try {
      if(typeof fn !== 'function') {
         throw new Error('Incorrect parameters supplied to unhook');
      }
      return (typeof fn._hookedFn !== 'undefined' ? fn._hookedFn : fn);
   } catch(err) {
      return _error(err);
   }
}

/**
 *
 */
function limit(fn, max) {
   try {
      if(typeof fn !== 'function') {
         throw new Error('Incorrect parameters supplied to limit');
      }
      max = (typeof max === 'number' ? max : 1);
      var limited = function() {
         limited.count = (typeof limited.count === 'number' ? limited.count + 1 : 1);
         if(limited.count > max) {
            throw new Error(fn.name + '() called beyond maximum of ' + max);
         }
         return fn.apply(this, arguments);
      }
      limited._limitedFn = fn;
      return limited;
   } catch(err) {
      return _error(err);
   }
}

/**
 *
 */
function unlimit(fn) {
   try {
      if(typeof fn !== 'function') {
         throw new Error('Incorrect parameters supplied to unlimit');
      }
      return (typeof fn._limitedFn !== 'undefined' ? fn._limitedFn : fn);
   } catch(err) {
      return _error(err);
   }
}

/**
 * Keep running the fn until cond returns true/error, then call the callback
 */
function repeat(cond, fn, cb) {
   try {
      if(typeof cond !== 'function' || typeof fn !== 'function' || typeof cb !== 'function') {
         throw new Error('Incorrect parameters supplied to repeat');
      }
      return cond(function(err, ok) {
         return (err || ok === true ? cb((err ? err : null)) : fn(function(err) {
            return (err ? nextTick(cb)(err) : nextTick(repeat)(cond, fn, cb));
         }));
      });
   } catch(err) {
      return _error(err, cb);
   }
}

module.exports = {
  nextTick: nextTick,
  chain: chain,
  each: each,
  eachInTurn: eachInTurn,
  hook: hook,
  unhook: unhook,
  limit: limit,
  unlimit: unlimit,
  repeat: repeat,
  wrap: wrap,
  unwrap: unwrap,
}
