/**
 * Test scripts
 */

var coolback = require('./index.js');
var assert = require("assert");

describe('coolback', function() {
   describe('wrap', function() {
      it('should have a wrap Method', function() {
         assert.equal(typeof coolback.wrap, 'function');
      });
      it('should throw an Error when wrapping if a function is not supplied', function() {
         assert.throws(
            function() {
               var dummy = coolback.wrap({});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to wrap/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
      it('should throw an Error when calling the wrap function if a callback is not supplied', function() {
         assert.throws(
            function() {
               coolback.wrap(JSON.stringify)({'hello': 'world'});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to stringify/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
      it('should respond with the result via a callback', function(done) {
         coolback.wrap(JSON.stringify)({'hello': 'world'}, function(err, obj) {
            assert.equal(err instanceof Error, false);
            assert.equal(err, null);
            assert.equal(typeof obj, 'string');
            assert.equal(obj, '{"hello":"world"}');
            done();
         });
      });
      it('should respond with an error via a callback', function(done) {
         coolback.wrap(JSON.parse)('{"hello":"world"', function(err, obj) {
            assert.equal(err instanceof Error, true);
            assert.equal(/SyntaxError/.test(err), true);
            assert.equal(obj, undefined);
            done();
         });
      });
   });
   describe('unwrap', function() {
      it('should have a unwrap Method', function() {
         assert.equal(typeof coolback.unwrap, 'function');
      });
      it('should restore a wrapped sync method back to sync style', function() {
         var dummy = coolback.wrap(JSON.stringify);
         JSON.stringify = coolback.unwrap(dummy);
         assert.equal(JSON.stringify({}), '{}');
      });
      it('should not affect an unwrapped function', function() {
         JSON.stringify = coolback.unwrap(JSON.stringify);
         assert.equal(JSON.stringify({}), '{}');
      });
      it('should throw an Error when calling the unwrap function if a function is not supplied', function() {
         assert.throws(
            function() {
               coolback.unwrap({});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to unwrap/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
   });
   describe('nextTick', function() {
      it('should have a nextTick Method', function() {
         assert.equal(typeof coolback.nextTick, 'function');
      });
      it('should call the supplied function with the supplied arguments', function(done) {
         var test = function(first, cb){cb(null, first)}
         coolback.nextTick(test)('hello', function(err, value) {
            assert.equal(err instanceof Error, false);
            assert.equal(value, 'hello');
            done();
         })
      });
      it('should throw an Error when calling the nextTick function if a function is not supplied', function() {
         assert.throws(
            function() {
               coolback.nextTick({});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to nextTick/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
   });
   describe('each', function() {
      it('should have a each Method', function() {
         assert.equal(typeof coolback.each, 'function');
      });
      it('should call the supplied function for each key of an object', function(done) {
         var callCount = 0;
         coolback.each({'first': 1, 'second': 2}, function(key, value, callback) {
            ++callCount;
            return callback(null);
         }, function(err) {
            assert.equal(err instanceof Error, false);
            assert.equal(callCount, 2);
            done();
         })
      });
      it('should call the supplied function for each element of an array', function(done) {
         var callCount = 0;
         coolback.each([1,2,3], function(key, value, callback) {
            ++callCount;
            return callback(null);
         }, function(err) {
            assert.equal(err instanceof Error, false);
            assert.equal(callCount, 3);
            done();
         })
      });
      it('should abort the loop when an error occurs', function(done) {
         var callCount = 0;
         coolback.each({'first': 1, 'second': 2}, function(key, value, callback) {
            ++callCount;
            return callback(new Error('Hello'));
         }, function(err) {
            assert.equal(err instanceof Error, true);
            assert.equal(/Hello/.test(err.message), true);
            done();
         })
      });
      it('should return an Error when calling the each function if an object is not supplied via the callback', function(done) {
         var callCount = 0;
         coolback.each(null, function(key, value, callback) {
            return callback(new Error('Hello'));
         }, function(err) {
            assert.equal(err instanceof Error, true);
            assert.equal(/Incorrect parameters supplied to each/.test(err.message), true);
            assert.equal(callCount, 0);
            done();
         })
      });
      it('should return an Error when calling the each function if an object is not supplied via the callback', function(done) {
         var callCount = 0;
         coolback.each({}, null, function(err) {
            assert.equal(err instanceof Error, true);
            assert.equal(/Incorrect parameters supplied to each/.test(err.message), true);
            assert.equal(callCount, 0);
            done();
         })
      });
      it('should throw an Error when calling the each function if an object is not supplied and no callback', function() {
         assert.throws(
            function() {
               coolback.each(null, function(){});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to each/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
      it('should throw an Error when calling the each function if a iterator is not supplied and no callback', function() {
         assert.throws(
            function() {
               coolback.each({});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to each/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
   });
   describe('eachInTurn', function() {
      it('should have a eachInTurn Method', function() {
         assert.equal(typeof coolback.eachInTurn, 'function');
      });
      it('should call the supplied function for each key of an object', function(done) {
         var callCount = 0;
         coolback.eachInTurn({'first': 1, 'second': 2}, function(key, value, callback) {
            ++callCount;
            return callback(null);
         }, function(err) {
            assert.equal(err instanceof Error, false);
            assert.equal(callCount, 2);
            done();
         })
      });
      it('should call the supplied function for each element of an array', function(done) {
         var callCount = 0;
         coolback.eachInTurn([1,2,3], function(key, value, callback) {
            ++callCount;
            return callback(null);
         }, function(err) {
            assert.equal(err instanceof Error, false);
            assert.equal(callCount, 3);
            done();
         })
      });
      it('should abort the loop when an error occurs', function(done) {
         var callCount = 0;
         coolback.eachInTurn({'first': 1, 'second': 2}, function(key, value, callback) {
            ++callCount;
            return callback(new Error('Hello'));
         }, function(err) {
            assert.equal(err instanceof Error, true);
            assert.equal(callCount, 1);
            assert.equal(/Hello/.test(err.message), true);
            done();
         })
      });
      it('should return an Error when calling the each function if an object is not supplied via the callback', function(done) {
         var callCount = 0;
         coolback.eachInTurn(null, function(key, value, callback) {
            return callback(new Error('Hello'));
         }, function(err) {
            assert.equal(err instanceof Error, true);
            assert.equal(/Incorrect parameters supplied to each/.test(err.message), true);
            assert.equal(callCount, 0);
            done();
         })
      });
      it('should return an Error when calling the each function if an object is not supplied via the callback', function(done) {
         var callCount = 0;
         coolback.eachInTurn({}, null, function(err) {
            assert.equal(err instanceof Error, true);
            assert.equal(/Incorrect parameters supplied to each/.test(err.message), true);
            assert.equal(callCount, 0);
            done();
         })
      });
      it('should throw an Error when calling the each function if an object is not supplied and no callback', function() {
         assert.throws(
            function() {
               coolback.eachInTurn(null, function(){});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to each/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
      it('should throw an Error when calling the each function if a iterator is not supplied and no callback', function() {
         assert.throws(
            function() {
               coolback.eachInTurn({});
            },
            function(err) {
               if (err instanceof Error && /Incorrect parameters supplied to each/.test(err.message) === true) {
                  return true;
               }
               return false;
            }
         );
      });
   });
   describe('chain', function() {
      it('should have a chain Method', function() {
         assert.equal(typeof coolback.chain, 'function');
      });
      it('should call each supplied function in turn', function(done) {
         var callCount = 0;
         coolback.chain([function(cb){++callCount;return cb(null)}, function(cb){++callCount;return cb(null)}], function(err) {
            assert.equal(err instanceof Error, false);
            assert.equal(callCount, 2);
            done();
         });
      });
      it('should pass parameters from one line to another', function(done) {
         var callCount = 0;
         coolback.chain([function(cb){return cb(null, 1)}, function(value, cb){callCount = value + 1;return cb(null)}], function(err) {
            assert.equal(err instanceof Error, false);
            assert.equal(callCount, 2);
            done();
         });
      });
   });
   describe('hook', function() {
      it('should have a hook Method', function() {
         assert.equal(typeof coolback.hook, 'function');
      });
      it('should throw an exception if a function is not passed to hook', function() {
        assert.throws(
           function() {
              coolback.hook(null);
           },
           function(err) {
              if (err instanceof Error && /Incorrect parameters supplied to hook/.test(err.message) === true) {
                 return true;
              }
              return false;
           }
        );
      });
      it('should throw an exception if a function is not passed call before/after', function() {
        assert.throws(
           function() {
              coolback.hook(console.log);
           },
           function(err) {
              if (err instanceof Error && /Incorrect parameters supplied to hook/.test(err.message) === true) {
                 return true;
              }
              return false;
           }
        );
      });
      it('should call a function before the hooked function is called - sync', function() {
        var testMe = function() {}
        var called = 0;
        var hooked = coolback.hook(testMe, function() {
          ++called;
          return arguments;
        });
        hooked()
        assert.equal(called, 1);
      });
      it('should pass the result of the before to the main function - sync', function() {
        var toPass = 'Second';
        var passed = null;
        var testMe = function() {
          passed = arguments[0];
        }
        var hooked = coolback.hook(testMe, function() {
          return [toPass];
        });
        hooked('First')
        assert.equal(toPass, passed);
      });
      it('should call a function after the hooked function is called - sync', function() {
        var testMe = function() {}
        var called = 0;
        var hooked = coolback.hook(testMe, null, function() {
          ++called;
          return arguments;
        });
        hooked()
        assert.equal(called, 1);
      });
      it('should pass the result of the main to the after function - sync', function() {
        var toPass = 'First';
        var passed = null;
        var testMe = function() {
          return arguments[0];
        }
        var hooked = coolback.hook(testMe, null, function() {
          passed = arguments[0];
        });
        hooked(toPass)
        assert.equal(toPass, passed);
      });
      it('should call a function before the hooked function is called - async', function(done) {
        var testMe = function(callback) {return callback(null)}
        var called = 0;
        var hooked = coolback.hook(testMe, function(callback) {
          ++called;
          return callback(null);
        });
        hooked(function(err) {
          assert.equal(called, 1);
          done();
        })
      });
      it('should pass the result of the before to the main function - async', function(done) {
        var toPass = 'Second';
        var passed = null;
        var testMe = function(val, callback) {
          passed = arguments[0];
          return callback(null, passed);
        }
        var hooked = coolback.hook(testMe, function(val, callback) {
          return callback(null, toPass);
        });
        hooked('First', function(){
          assert.equal(toPass, passed);
          done();
        })
      });
      it('should call a function after the hooked function is called - async', function(done) {
        var testMe = function(callback) {return callback(null);}
        var called = 0;
        var hooked = coolback.hook(testMe, null, function(callback) {
          ++called;
          return callback(null);
        });
        hooked(function() {
          assert.equal(called, 1);
          done();
        })
      });
      it('should pass the result of the main to the after function - async', function(done) {
        var toPass = 'Second';
        var passed = null;
        var testMe = function(val, callback) {
          passed = arguments[0];
          return callback(null, toPass);
        }
        var hooked = coolback.hook(testMe, null, function(val, callback) {
          passed = toPass
          return callback(null, toPass);
        });
        hooked('First', function(){
          assert.equal(toPass, passed);
          done();
        })
      });
   });
   describe('unhook', function() {
      it('should have a unhook Method', function() {
         assert.equal(typeof coolback.unhook, 'function');
      });
      it('should restored a hooked function to it\'s pre-hooked state', function() {
        var testMe = function() {}
        var called = 0;
        var hooked = coolback.hook(testMe, function() {
          ++called;
          return arguments;
        });
        hooked();
        assert.equal(called, 1);
        called = 0;
        hooked = coolback.unhook(hooked);
        hooked();
        assert.equal(called, 0);
      });
   });
   describe('limit', function() {
      it('should have a limit Method', function() {
         assert.equal(typeof coolback.limit, 'function');
      });
      it('should throw an exception if a limited function is called too many times', function() {
        var testMe = function() {};
        var limited = coolback.limit(testMe, 3);
        assert.throws(
           function() {
             limited();
             limited();
             limited();
             limited();
           },
           function(err) {
              if (err instanceof Error && /called beyond maximum of/.test(err.message) === true) {
                 return true;
              }
              return false;
           }
        );
      });
      it('should set the limit to 1 if no limit supplied', function() {
        var testMe = function() {};
        var limited = coolback.limit(testMe);
        assert.throws(
           function() {
             limited();
             limited();
           },
           function(err) {
              if (err instanceof Error && /called beyond maximum of/.test(err.message) === true) {
                 return true;
              }
              return false;
           }
        );
      });
   });
   describe('unlimit', function() {
      it('should have a unlimit Method', function() {
         assert.equal(typeof coolback.unlimit, 'function');
      });
      it('should remove limits to a function', function() {
        var testMe = function() {};
        var limited = coolback.limit(testMe);
        var res = null;
        limited = coolback.unlimit(testMe);
        try {
          limited();
          limited();
          limited();
          limited();
          limited();
        } catch(err) {
          res = err;
        }
        assert.equal(res instanceof Error, false);
        assert.equal(res, null);
      });
   });
   describe('repeat', function() {
      it('should have a repeat Method', function() {
         assert.equal(typeof coolback.repeat, 'function');
      });
      it('should throw an error if not supplied the correct parameters', function() {
        assert.throws(
           function() {
             coolback.repeat(function(){}, function(){});
           },
           function(err) {
              if (err instanceof Error && /Incorrect parameters supplied to repeat/.test(err.message) === true) {
                 return true;
              }
              return false;
           }
        );
      });
      it('should continue to call the execute function until condition is true', function(done) {
        var i = 0;
        coolback.repeat(function(callback) {
          return callback(null, (i >= 2))
        }, function(callback) {
          ++i;
          return callback(null);
        }, function(err) {
          assert.equal(err instanceof Error, false);
          assert.equal(i, 2);
          done();
        });
      });
      it('should return an errors from execute function', function(done) {
        var i = 0;
        coolback.repeat(function(callback) {
          return callback(null, (i >= 2))
        }, function(callback) {
          return callback(new Error('This is an error'));
        }, function(err) {
          assert.equal(err instanceof Error, true);
          assert.equal(/This is an error/.test(err.message), true);
          done();
        });
      });
   });
});
