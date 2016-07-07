/****
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2016 Aaron Trent
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 ****/
'use strict';

exports.__esModule      = true;
exports.EventPropagator = void 0;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function( obj ) {
    return typeof obj;
} : function( obj ) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};
/**
 * Created by Aaron on 6/27/2016.
 */

exports.isPropagating = isPropagating;
exports.propagateOnce   = propagateOnce;
exports.propagate       = propagate;
exports.stopPropagating = stopPropagating;

var _events = require( 'events' );

var _assert = require( 'assert' );

var _once = require( './once.js' );

function _classCallCheck( instance, Constructor ) {
    if( !(instance instanceof Constructor) ) {
        throw new TypeError( "Cannot call a class as a function" );
    }
}

function _possibleConstructorReturn( self, call ) {
    if( !self ) {
        throw new ReferenceError( "this hasn't been initialised - super() hasn't been called" );
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits( subClass, superClass ) {
    if( typeof superClass !== "function" && superClass !== null ) {
        throw new TypeError( "Super expression must either be null or a function, not " + typeof superClass );
    }
    subClass.prototype = Object.create( superClass && superClass.prototype,
        {constructor: {value: subClass, enumerable: false, writable: true, configurable: true}} );
    if( superClass ) {
        Object.setPrototypeOf ? Object.setPrototypeOf( subClass, superClass ) :
        subClass.__proto__ = superClass;
    }
}

function isPropagating( source, target, event ) {
    (0, _assert.ok)( source instanceof _events.EventEmitter, 'source must be an EventEmitter' );
    (0, _assert.ok)( target instanceof _events.EventEmitter, 'target must be an EventEmitter' );

    (0, _assert.strictEqual)( typeof event === 'undefined' ? 'undefined' : _typeof( event ), 'string',
        'event must be a string' );

    for( var _iterator = source.listeners( event ), _isArray = Array.isArray(
        _iterator ), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ; ) {
        var _ref;

        if( _isArray ) {
            if( _i >= _iterator.length ) {
                break;
            }
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if( _i.done ) {
                break;
            }
            _ref = _i.value;
        }

        var listener = _ref;

        if( listener.__target__ === target && listener.__active__ ) {
            return true;
        }
    }

    return false;
}

function propagateOnce( source, target, event ) {
    var onEvent = arguments.length <= 3 || arguments[3] === void 0 ? function() {
        return true;
    } : arguments[3];
    var context = arguments[4];

    return propagate( source, target, event, onEvent, true, context );
}

function propagate( source, target, event ) {
    var onEvent  = arguments.length <= 3 || arguments[3] === void 0 ? function() {
        return true;
    } : arguments[3];
    var onlyOnce = arguments.length <= 4 || arguments[4] === void 0 ? false : arguments[4];
    var context  = arguments[5];

    (0, _assert.notStrictEqual)( source, target, 'Cannot propagate events to self.' );

    (0, _assert.strictEqual)( typeof onEvent === 'undefined' ? 'undefined' : _typeof( onEvent ), 'function',
        'onEvent must be a function' );

    if( !isPropagating( source, target, event ) ) {
        var _listener;

        if( onlyOnce ) {
            _listener = (0, _once.once)( function() {
                for( var _len = arguments.length, args = Array( _len ), _key = 0; _key < _len; _key++ ) {
                    args[_key] = arguments[_key];
                }

                if( _listener.__active__ ) {
                    var res = onEvent.apply( context, args );

                    if( res !== false ) {
                        target.emit.apply( target, [event].concat( args ) );
                    }

                    _listener.__active__ = false;
                }

                source.removeListener( event, _listener );
            } );
        } else {
            _listener = function listener() {
                for( var _len2 = arguments.length, args = Array( _len2 ), _key2 = 0; _key2 < _len2; _key2++ ) {
                    args[_key2] = arguments[_key2];
                }

                if( _listener.__active__ ) {
                    var res = onEvent.apply( context, args );

                    if( res !== false ) {
                        target.emit.apply( target, [event].concat( args ) );
                    }
                }
            };
        }

        _listener.__target__ = target;
        _listener.__source__ = source;
        _listener.__active__ = true;

        source.addListener( event, _listener );
    }
}

function stopPropagating( source, target, event ) {
    (0, _assert.ok)( source instanceof _events.EventEmitter, 'source must be an EventEmitter' );
    (0, _assert.ok)( target instanceof _events.EventEmitter, 'target must be an EventEmitter' );

    (0, _assert.strictEqual)( typeof event === 'undefined' ? 'undefined' : _typeof( event ), 'string',
        'event must be a string' );

    for( var _iterator2 = source.listeners( event ), _isArray2 = Array.isArray(
        _iterator2 ), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ; ) {
        var _ref2;

        if( _isArray2 ) {
            if( _i2 >= _iterator2.length ) {
                break;
            }
            _ref2 = _iterator2[_i2++];
        } else {
            _i2 = _iterator2.next();
            if( _i2.done ) {
                break;
            }
            _ref2 = _i2.value;
        }

        var listener = _ref2;

        if( listener.__target__ === target && listener.__source__ === source ) {
            listener.__active__ = false;

            source.removeListener( event, listener );
        }
    }
}

var EventPropagator = exports.EventPropagator = function( _EventEmitter ) {
    _inherits( EventPropagator, _EventEmitter );

    function EventPropagator() {
        _classCallCheck( this, EventPropagator );

        return _possibleConstructorReturn( this, _EventEmitter.apply( this, arguments ) );
    }

    EventPropagator.prototype.isPropagatingTo = function isPropagatingTo( target, event ) {
        return isPropagating( this, target, event );
    };

    EventPropagator.prototype.isPropagatingFrom = function isPropagatingFrom( source, event ) {
        return isPropagating( source, this, event );
    };

    EventPropagator.prototype.propagateTo = function propagateTo( target, event, onEvent, onlyOnce ) {
        var context = arguments.length <= 4 || arguments[4] === void 0 ? this : arguments[4];

        propagate( this, target, event, onEvent, onlyOnce, context );

        return this;
    };

    EventPropagator.prototype.stopPropagatingTo = function stopPropagatingTo( target, event ) {
        stopPropagating( this, target, event );

        return this;
    };

    EventPropagator.prototype.propagateFrom = function propagateFrom( source, event, onEvent, onlyOnce ) {
        var context = arguments.length <= 4 || arguments[4] === void 0 ? this : arguments[4];

        propagate( source, this, event, onEvent, onlyOnce, context );

        return this;
    };

    EventPropagator.prototype.stopPropagatingFrom = function stopPropagatingFrom( source, event ) {
        stopPropagating( source, this, event );

        return this;
    };

    return EventPropagator;
}( _events.EventEmitter );
