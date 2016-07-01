'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function( obj ) {
    return typeof obj;
} : function( obj ) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};
/**
 * Created by Aaron on 6/30/2016.
 */

var _events = require( 'events' );

var _ = require( '../../' );

var _assert = require( 'assert' );

var asyncTimeout = 200;

describe( 'Basic tests', function() {
    it( 'Existence', function() {
        (0, _assert.strictEqual)( typeof _.EventPropagator === 'undefined' ? 'undefined' : _typeof( _.EventPropagator ),
            'function' );
        (0, _assert.strictEqual)( typeof _.isPropagating === 'undefined' ? 'undefined' : _typeof( _.isPropagating ),
            'function' );
        (0, _assert.strictEqual)( typeof _.propagate === 'undefined' ? 'undefined' : _typeof( _.propagate ),
            'function' );
        (0, _assert.strictEqual)( typeof _.stopPropagating === 'undefined' ? 'undefined' : _typeof( _.stopPropagating ),
            'function' );
    } );

    it( 'Inheritance', function() {
        (0, _assert.ok)( new _.EventPropagator() instanceof _events.EventEmitter );
    } );
} );

describe( "Propagation", function() {
    var event     = "someEvent";
    var onceEvent = "onceEvent";

    var source = new _events.EventEmitter();
    var target = new _events.EventEmitter();

    it( "should detect when no propagations are added", function() {
        (0, _assert.ok)( !(0, _.isPropagating)( source, target, event ) );
        (0, _assert.ok)( !(0, _.isPropagating)( target, source, event ) );
    } );

    it( "should listen on the source", function() {
        (0, _.propagate)( source, target, event );

        (0, _assert.ok)( (0, _.isPropagating)( source, target, event ), "propagator not added" );
        (0, _assert.ok)( !(0, _.isPropagating)( target, source, event ), "propagator added to wrong emitter" );

        var listeners = source.listeners( event );

        (0, _assert.strictEqual)( listeners.length, 1, "only one listener should be added" );

        (0, _assert.strictEqual)( listeners[0].__target__, target, "that listener should point to the target" );
    } );

    it( "should propagate the given event", function( done ) {
        target.once( event, done );

        source.emit( event );
    } );

    it( "should remove propagator if requested", function( done ) {
        (0, _.stopPropagating)( source, target, event );

        target.once( event, function() {
            done( new Error( "this shouldn't be reached" ) );
        } );

        source.emit( event );

        setTimeout( function() {
            try {
                (0, _assert.ok)( !(0, _.isPropagating)( source, target, event ),
                    "The listener should have been removed" );

                done();
            } catch( err ) {
                done( err );
            }
        }, asyncTimeout );
    } );

    it( "should allow a single propagation", function( done ) {
        (0, _.propagate)( source, target, onceEvent, void 0, true );

        (0, _assert.ok)( (0, _.isPropagating)( source, target, onceEvent ), "propagator not added" );
        (0, _assert.ok)( !(0, _.isPropagating)( target, source, onceEvent ), "propagator added to wrong emitter" );

        var count = 0;

        target.on( onceEvent, function() {
            count++;
        } );

        setTimeout( function() {
            if( count === 1 ) {
                done();
            } else {
                done( new Error( "Invalid number of events received" ) );
            }
        }, asyncTimeout );

        source.emit( onceEvent );

        //Then these are ignored since the listener was removed
        source.emit( onceEvent );
        source.emit( onceEvent );
    } );

    describe( "Custom middle callbacks", function() {
        var callbackEvent  = "callbackEvent";
        var callbackEvent2 = "callbackEvent2";
        var callbackEvent3 = "callbackEvent3";

        it( "should invoke callbacks if given", function( done ) {
            var didCall = false;

            function callback( value ) {
                (0, _assert.strictEqual)( value, 42 );
                didCall = true;
            }

            (0, _.propagate)( source, target, callbackEvent, callback, true );

            setTimeout( function() {
                if( didCall ) {
                    done();
                } else {
                    done( new Error( "Invalid number of events received" ) );
                }
            }, asyncTimeout );

            source.emit( callbackEvent, 42 );
        } );

        it( "should allow cancelling the event propagation", function( done ) {
            var didCall = false;

            function callback( value ) {
                (0, _assert.strictEqual)( value, 42 );
                return false;
            }

            (0, _.propagate)( source, target, callbackEvent2, callback, true );

            target.once( callbackEvent2, function() {
                didCall = true;
            } );

            setTimeout( function() {
                //Notice the reversed logic
                if( !didCall ) {
                    done();
                } else {
                    done( new Error( "Invalid number of events received" ) );
                }
            }, asyncTimeout );

            source.emit( callbackEvent2, 42 );
        } );

        it( "should allow custom contexts for the middle callbacks to be invoked with", function( done ) {
            var didCall = false;
            var context = {};

            function callback() {
                (0, _assert.strictEqual)( this, context );
                didCall = true;
            }

            (0, _.propagate)( source, target, callbackEvent3, callback, true, context );

            setTimeout( function() {
                if( didCall ) {
                    done();
                } else {
                    done( new Error( "Invalid number of events received" ) );
                }
            }, asyncTimeout );

            source.emit( callbackEvent3 );
        } );
    } );
} );
