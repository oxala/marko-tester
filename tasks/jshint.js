'use strict';

module.exports = function jshint(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');

    var sourcesToCheck = [
        'source/!(generated-tests)/*.js',
        'test/**/*.js'
    ];

    return {
        validate: {
            src: sourcesToCheck,
            options: {
                jshintrc: '.jshintrc'
            }
        }
    };
};
