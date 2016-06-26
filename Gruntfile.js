/**
 * Created by novacrazy on 7/8/14.
 */

module.exports = function( grunt ) {

    grunt.loadNpmTasks( 'grunt-babel' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-banner' );

    var LICENSE = '/****\n * ' + grunt.file.read( './LICENSE', {encoding: 'utf-8'} ).replace( /\n/ig, '\n * ' )
                  + '\n ****/';

    var loose = {loose: true};

    grunt.initConfig( {
        babel:     {
            options: {
                ast:        false,
                sourceMaps: false,
                compact:    false
            },
            build:   {
                options: {
                    plugins: [
                        ["transform-class-constructor-call", loose],
                        ["transform-class-properties", loose],
                        ["transform-strict-mode", loose],
                        ["transform-es2015-arrow-functions", loose],
                        ["transform-es2015-block-scoped-functions", loose],
                        ["transform-es2015-block-scoping", loose],
                        ["transform-es2015-classes", loose],
                        ["transform-es2015-computed-properties", loose],
                        ["transform-es2015-destructuring", loose],
                        ["transform-es2015-for-of", loose],
                        ["transform-es2015-function-name", loose],
                        ["transform-es2015-literals", loose],
                        ["transform-es2015-modules-commonjs", loose],
                        ["transform-es2015-object-super", loose],
                        ["transform-es2015-parameters", loose],
                        ["transform-es2015-shorthand-properties", loose],
                        ["transform-es2015-spread", loose],
                        ["transform-object-rest-spread", loose],
                        ["transform-undefined-to-void", loose]
                    ]
                },
                files:   [
                    {
                        expand: true,
                        cwd:    './src/',
                        src:    './**/*.js',
                        dest:   './build/'
                    },
                    {
                        expand: true,
                        cwd:    './test/src/',
                        src:    './**/*.js',
                        dest:   './test/build/'
                    }
                ]
            }
        },
        usebanner: {
            license: {
                options: {
                    position:  'top',
                    banner:    LICENSE,
                    linebreak: true
                },
                files:   {
                    src: ['./build/**/*.js']
                }
            }
        },
        clean:     {
            build: {
                src: ['./build']
            },
            tests: {
                src: ['./test/build']
            }
        }
    } );

    grunt.registerTask( 'build', [
        'clean:tests',
        'clean:build',
        'babel:build',
        'usebanner:license'
    ] );

    grunt.registerTask( 'default', ['build'] );
};
