'use strict';

module.exports = function jshint(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');

    var sourcesToCheck = [
        'source/**/*.js',
        'test/**/*.js',
        '!source/generated-tests/**/*.js'
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
