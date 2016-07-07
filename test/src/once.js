/**
 * Created by Aaron on 7/7/2016.
 */

import {strictEqual} from 'assert';
import {once} from '../../build/once.js';

describe( "Once", function() {
    it( "should only allow a function to run once then re-use the result", function() {
        let count = 0;

        let fn = once( function() {
            count += 1;

            return count;
        } );

        strictEqual( fn(), 1 );
        strictEqual( fn(), 1 );
        strictEqual( fn(), 1 );

        strictEqual( count, 1 );
    } );
} );