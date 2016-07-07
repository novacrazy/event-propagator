'use strict';

var _assert = require( 'assert' );

var _once = require( '../../build/once.js' );

/**
 * Created by Aaron on 7/7/2016.
 */

describe( "Once", function() {
    it( "should only allow a function to run once then re-use the result", function() {
        var count = 0;

        var fn = (0, _once.once)( function() {
            count += 1;

            return count;
        } );

        (0, _assert.strictEqual)( fn(), 1 );
        (0, _assert.strictEqual)( fn(), 1 );
        (0, _assert.strictEqual)( fn(), 1 );

        (0, _assert.strictEqual)( count, 1 );
    } );
} );
