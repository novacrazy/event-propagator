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
                    presets: [
                        "es2015-loose"
                    ],
                    plugins: [
                        ["transform-class-constructor-call", loose],
                        ["transform-class-properties", loose],
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
