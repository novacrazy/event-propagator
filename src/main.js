/**
 * Created by Aaron on 6/27/2016.
 */

import {once} from 'lodash';
import {EventEmitter} from 'events';
import {ok as assert, strictEqual} from 'assert';

export function isPropagating( source, target, event ) {
    assert( source instanceof EventEmitter, 'source must be an EventEmitter' );
    assert( target instanceof EventEmitter, 'target must be an EventEmitter' );

    strictEqual( typeof event, 'string', 'event must be a string' );

    for( let listener of source.listeners( event ) ) {
        if( listener.__target__ === target && listener.__active__ ) {
            return true;
        }
    }

    return false;
}

export function propagate( source, target, event, onEvent = () => true, onlyOnce = false, context ) {
    strictEqual( typeof onEvent, 'function', 'onEvent must be a function' );

    if( !isPropagating( source, target, event ) ) {
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

                source.removeListener( event, listener );
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
        listener.__source__ = source;
        listener.__active__ = true;

        source.addListener( event, listener );
    }
}

export function stopPropagating( source, target, event ) {
    assert( source instanceof EventEmitter, 'source must be an EventEmitter' );
    assert( target instanceof EventEmitter, 'target must be an EventEmitter' );

    strictEqual( typeof event, 'string', 'event must be a string' );

    for( let listener of source.listeners( event ) ) {
        if( listener.__target__ === target && listener.__source__ === source ) {
            source.removeListener( event, listener );
        }
    }
}

export class EventPropagator extends EventEmitter {
    isPropagatingTo( target, event ) {
        return isPropagating( this, target, event );
    }

    isPropagatingFrom( source, event ) {
        return isPropagating( source, this, event );
    }

    propagateTo( target, event, onEvent, onlyOnce, context = this ) {
        propagate( this, target, event, onEvent, onlyOnce, context );

        return this;
    }

    stopPropagatingTo( target, event ) {
        stopPropagating( this, target, event );

        return this;
    }

    propagateFrom( source, event, onEvent, onlyOnce, context = this ) {
        propagate( source, this, event, onEvent, onlyOnce, context );

        return this;
    }

    stopPropagatingFrom( source, event ) {
        stopPropagating( source, this, event );

        return this;
    }
}