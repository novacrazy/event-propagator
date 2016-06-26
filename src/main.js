/**
 * Created by Aaron on 6/26/2016.
 */
import {once} from 'lodash';
import {EventEmitter} from 'events';
import {ok as assert, strictEqual} from 'assert';

export default class EventPropagator extends EventEmitter {
    static instanceCounter = 0;

    _instance = 0;

    constructor( propagateEvents = false ) {
        super();

        this._propagateEvents = !!propagateEvents;
    }

    propagateEvents( enable = true ) {
        if( enable !== this._propagateEvents ) {
            this.reInstance();
        }

        this._propagateEvents = enable;
    }

    reInstance() {
        this._instance = ++EventPropagator.instanceCounter;
    }

    isPropagatingFrom( emitter, event ) {
        for( let listener of emitter.listeners( event ) ) {
            if( listener.__target__ === this ) {
                return true;
            }
        }

        return false;
    }

    propagateFrom( emitter, event, options = {} ) {
        assert( emitter instanceof EventEmitter, 'emitter must be an EventEmitter instance.' );
        strictEqual( typeof event, 'string', 'event must be a string' );

        const {
                  onlyOnce = false,
                  handler = () => true,
                  instance = true
              } = options;

        if( this._propagateEvents && !this.isPropagatingFrom( emitter, event ) ) {
            var propagate;

            if( onlyOnce ) {
                propagate = once( ( ...args ) => {
                    if( !propagate._hasPropagated && this._propagateEvents &&
                        (!instance || this._instance === propagate.__instance__ ) ) {

                        let res = handler.apply( this, args );

                        if( res !== false ) {
                            this.emit( event, ...args );
                        }

                        propagate._hasPropagated = true;
                    }

                    emitter.removeListener( event, propagate );
                } );

                propagate._hasPropagated = false;

            } else {
                propagate = ( ...args ) => {
                    if( instance && this._instance !== propagate.__instance__ ) {
                        emitter.removeListener( event, propagate );

                        return;
                    }

                    if( this._propagateEvents ) {
                        let res = handler.apply( this, args );

                        if( res !== false ) {
                            this.emit( event, ...args );
                        }
                    }
                }
            }

            propagate.__target__   = this;
            propagate.__instance__ = this._instance;

            emitter.on( event, propagate );
        }
    }

    /*
     * Reverse logic to make it easier sometimes
     * */

    isPropagatingTo( emitter, event ) {
        return emitter.isPropagatingFrom( this, event );
    }

    propagateTo( emitter, event, handler ) {
        assert( emitter instanceof EventPropagator, 'emitter must be an EventPropagator instance.' );

        emitter.propagateFrom( this, event, handler );
    }

    isPropagatingEvents( emitter = null ) {
        return this._propagateEvents;
    }
}