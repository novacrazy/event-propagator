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

exports.__esModule = true;

var _lodash = require( 'lodash' );

var _events = require( 'events' );

var _assert = require( 'assert' );

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
/**
 * Created
 * by
 * Aaron
 * on
 * 6/26/2016.
 */


var EventPropagator = function( _EventEmitter ) {
    _inherits( EventPropagator, _EventEmitter );

    function EventPropagator() {
        var propagateEvents = arguments.length <= 0 || arguments[0] === void 0 ? false : arguments[0];

        _classCallCheck( this, EventPropagator );

        var _this = _possibleConstructorReturn( this, _EventEmitter.call( this ) );

        _this._instance = 0;


        _this._propagateEvents = !!propagateEvents;
        return _this;
    }

    EventPropagator.prototype.propagateEvents = function propagateEvents() {
        var enable = arguments.length <= 0 || arguments[0] === void 0 ? true : arguments[0];

        if( enable !== this._propagateEvents ) {
            this.reInstance();
        }

        this._propagateEvents = enable;
    };

    EventPropagator.prototype.reInstance = function reInstance() {
        this._instance = ++EventPropagator.instanceCounter;
    };

    EventPropagator.prototype.isPropagatingFrom = function isPropagatingFrom( emitter, event ) {
        for( var _iterator = emitter.listeners( event ), _isArray = Array.isArray(
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

            if( listener.__target__ === this ) {
                return true;
            }
        }

        return false;
    };

    EventPropagator.prototype.propagateFrom = function propagateFrom( emitter, event ) {
        var _this2 = this;

        var options = arguments.length <= 2 || arguments[2] === void 0 ? {} : arguments[2];

        (0, _assert.ok)( emitter instanceof _events.EventEmitter, 'emitter must be an EventEmitter instance.' );
        (0, _assert.strictEqual)( typeof event, 'string', 'event must be a string' );

        var _options$onlyOnce = options.onlyOnce;
        var onlyOnce          = _options$onlyOnce === void 0 ? false : _options$onlyOnce;
        var _options$handler  = options.handler;
        var handler           = _options$handler === void 0 ? function() {
            return true;
        } : _options$handler;
        var _options$instance = options.instance;
        var instance          = _options$instance === void 0 ? true : _options$instance;


        if( this._propagateEvents && !this.isPropagatingFrom( emitter, event ) ) {
            var _propagate;

            if( onlyOnce ) {
                _propagate = (0, _lodash.once)( function() {
                    for( var _len = arguments.length, args = Array( _len ), _key = 0; _key < _len; _key++ ) {
                        args[_key] = arguments[_key];
                    }

                    if( !_propagate._hasPropagated && _this2._propagateEvents &&
                        (!instance || _this2._instance === _propagate.__instance__) ) {

                        var res = handler.apply( _this2, args );

                        if( res !== false ) {
                            _this2.emit.apply( _this2, [event].concat( args ) );
                        }

                        _propagate._hasPropagated = true;
                    }

                    emitter.removeListener( event, _propagate );
                } );

                _propagate._hasPropagated = false;
            } else {
                _propagate = function propagate() {
                    for( var _len2 = arguments.length, args = Array( _len2 ), _key2 = 0; _key2 < _len2; _key2++ ) {
                        args[_key2] = arguments[_key2];
                    }

                    if( instance && _this2._instance !== _propagate.__instance__ ) {
                        emitter.removeListener( event, _propagate );

                        return;
                    }

                    if( _this2._propagateEvents ) {
                        var res = handler.apply( _this2, args );

                        if( res !== false ) {
                            _this2.emit.apply( _this2, [event].concat( args ) );
                        }
                    }
                };
            }

            _propagate.__target__   = this;
            _propagate.__instance__ = this._instance;

            emitter.on( event, _propagate );
        }
    };

    /*
     * Reverse logic to make it easier sometimes
     * */

    EventPropagator.prototype.isPropagatingTo = function isPropagatingTo( emitter, event ) {
        return emitter.isPropagatingFrom( this, event );
    };

    EventPropagator.prototype.propagateTo = function propagateTo( emitter, event, handler ) {
        (0, _assert.ok)( emitter instanceof EventPropagator, 'emitter must be an EventPropagator instance.' );

        emitter.propagateFrom( this, event, handler );
    };

    EventPropagator.prototype.isPropagatingEvents = function isPropagatingEvents() {
        var emitter = arguments.length <= 0 || arguments[0] === void 0 ? null : arguments[0];

        return this._propagateEvents;
    };

    return EventPropagator;
}( _events.EventEmitter );

EventPropagator.instanceCounter = 0;
exports.default                 = EventPropagator;
