/**
 * Created by Aaron on 7/7/2016.
 */

import {strictEqual} from 'assert';

export function once( fn ) {
    strictEqual( typeof fn, 'function' );

    let ran   = false;
    let value = void 0;

    return function() {
        if( !ran ) {
            value = fn.apply( this, arguments );
            ran   = true;
        }

        return value;
    };
}