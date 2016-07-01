/**
 * Created by Aaron on 6/30/2016.
 */

import {EventEmitter} from 'events';
import {EventPropagator, isPropagating, propagate, stopPropagating} from '../../';
import {ok as assert, strictEqual} from 'assert';

const asyncTimeout = 200;

describe( 'Basic tests', function() {
    it( 'Existence', function() {
        strictEqual( typeof EventPropagator, 'function' );
        strictEqual( typeof isPropagating, 'function' );
        strictEqual( typeof propagate, 'function' );
        strictEqual( typeof stopPropagating, 'function' );
    } );

    it( 'Inheritance', function() {
        assert( new EventPropagator() instanceof EventEmitter );
    } );
} );

describe( "Propagation", function() {
    const event     = "someEvent";
    const onceEvent = "onceEvent";

    let source = new EventEmitter();
    let target = new EventEmitter();

    it( "should detect when no propagations are added", function() {
        assert( !isPropagating( source, target, event ) );
        assert( !isPropagating( target, source, event ) );
    } );

    it( "should listen on the source", function() {
        propagate( source, target, event );

        assert( isPropagating( source, target, event ), "propagator not added" );
        assert( !isPropagating( target, source, event ), "propagator added to wrong emitter" );

        const listeners = source.listeners( event );

        strictEqual( listeners.length, 1, "only one listener should be added" );

        strictEqual( listeners[0].__target__, target, "that listener should point to the target" );
    } );

    it( "should propagate the given event", function( done ) {
        target.once( event, done );

        source.emit( event );
    } );

    it( "should remove propagator if requested", function( done ) {
        stopPropagating( source, target, event );

        target.once( event, () => {
            done( new Error( "this shouldn't be reached" ) );
        } );

        source.emit( event );

        setTimeout( function() {
            try {
                assert( !isPropagating( source, target, event ), "The listener should have been removed" );

                done();

            } catch( err ) {
                done( err );
            }
        }, asyncTimeout );
    } );

    it( "should allow a single propagation", function( done ) {
        propagate( source, target, onceEvent, void 0, true );

        assert( isPropagating( source, target, onceEvent ), "propagator not added" );
        assert( !isPropagating( target, source, onceEvent ), "propagator added to wrong emitter" );

        let count = 0;

        target.on( onceEvent, () => {
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
        const callbackEvent  = "callbackEvent";
        const callbackEvent2 = "callbackEvent2";
        const callbackEvent3 = "callbackEvent3";

        it( "should invoke callbacks if given", function( done ) {
            let didCall = false;

            function callback( value ) {
                strictEqual( value, 42 );
                didCall = true;
            }

            propagate( source, target, callbackEvent, callback, true );

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
            let didCall = false;

            function callback( value ) {
                strictEqual( value, 42 );
                return false;
            }

            propagate( source, target, callbackEvent2, callback, true );

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
            let didCall = false;
            let context = {};

            function callback() {
                strictEqual( this, context );
                didCall = true;
            }

            propagate( source, target, callbackEvent3, callback, true, context );

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
