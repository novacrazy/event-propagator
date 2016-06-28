/**
 * Created by Aaron on 6/27/2016.
 */

import {once} from 'lodash';
import {EventEmitter} from 'events';
import {ok as assert, strictEqual} from 'assert';

function isPropagatingTo( source, target, event ) {
    assert( source instanceof EventEmitter, 'emitter must be an instance of EventEmitter' );
    assert( target instanceof EventEmitter, 'emitter must be an instance of EventEmitter' );

    strictEqual( typeof event, 'string', 'event must be a string' );

    for( let listener of source.listeners( event ) ) {
        if( listener.__target__ === target && listener.__active__ ) {
            return true;
        }
    }

    return false;
}

function propagateTo( source, target, event, onEvent = () => true, onlyOnce = false, context ) {
    strictEqual( typeof onEvent, 'function', 'onEvent must be a function' );

    if( !isPropagatingTo( source, target, event ) ) {
        var listener;

        if( onlyOnce ) {
            listener = once( ( ...args ) => {
                if( listener.__active__ ) {
                    let res = onEvent.apply( context, args );

                    if( res !== false ) {
                        target.emit( event, ...args );
                    }

                    listener.__active__ = false;
                }

                target.removeListener( event, listener );
            } );

        } else {
            listener = ( ...args ) => {
                if( listener.__active__ ) {
                    let res = onEvent.apply( context, args );

                    if( res !== false ) {
                        target.emit( event, ...args );
                    }
                }
            };
        }

        listener.__target__ = target;
        listener.__source__ = target;
        listener.__active__ = true;

        target.addListener( event, listener );
    }
}

function stopPropagatingTo( source, target, event ) {
    assert( source instanceof EventEmitter, 'emitter must be an EventEmitter' );
    assert( target instanceof EventEmitter, 'emitter must be an EventEmitter' );

    strictEqual( typeof event, 'string', 'event must be a string' );

    for( let listener of source.listeners( event ) ) {
        if( listener.__target__ === target && listener.__source__ === source ) {
            source.removeListener( listener );
        }
    }
}

export default class EventPropagator extends EventEmitter {
    isPropagatingTo( target, event ) {
        return isPropagatingTo( this, target, event );
    }

    isPropagatingFrom( source, event ) {
        return isPropagatingTo( source, this, event );
    }

    propagateTo( target, event, onEvent, onlyOnce, context = this ) {
        propagateTo( this, target, event, onEvent, onlyOnce, context );

        return this;
    }

    stopPropagatingTo( target, event ) {
        stopPropagatingTo( this, target, event );

        return this;
    }

    propagateFrom( source, event, onEvent, onlyOnce, context = this ) {
        propagateTo( source, this, event, onEvent, onlyOnce, context );

        return this;
    }

    stopPropagatingFrom( source, event ) {
        stopPropagatingTo( source, this, event );

        return this;
    }
}