'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: 'src',
        dist: 'dist'
    };

    grunt.initConfig({
        // Project settings
        pkg: grunt.file.readJSON('package.json'),
        appConfig: appConfig,
        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= appConfig.dist %>/{,*/}*'
                    ]
                }]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    //captureFile: 'test-results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            minimize: {
                options: {
                    beautify: false,
                    compress: true,
                    sourceMap: true
                },
                files: {
                    '<%= appConfig.dist %>/sel.min.js': ['<%= appConfig.app %>/*.js']
                }
            },
            beautify: {
                options: {
                    beautify: {
                        width: 80,
                        beautify: true
                    },
                    compress: false,
                    sourceMap: false,
                    mangle: false
                },
                files: {
                    '<%= appConfig.dist %>/sel.js': ['<%= appConfig.app %>/*.js']
                }
            }
        }
    });

    grunt.registerTask('compile', [
        'clean:dist',
        'uglify:minimize',
        'uglify:beautify'
    ]);

    grunt.registerTask('test', [
        'compile',
        'mochaTest'
    ]);

    grunt.registerTask('build', [
        'compile',
        'test'
    ]);

    grunt.registerTask('default', 'build');
};