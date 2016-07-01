/**
 * Created by Aaron on 6/30/2016.
 */

import {EventEmitter} from 'events';
import {EventPropagator, isPropagating, propagate, stopPropagating} from '../../';
import {ok as assert, strictEqual} from 'assert';

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

        setTimeout( done, 200 );
    } )


} );