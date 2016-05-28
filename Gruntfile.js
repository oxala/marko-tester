'use strict';

module.exports = function (grunt) {
    require('grunt-config-dir')(grunt, {
        configDir: require('path').join(__dirname, 'tasks')
    });

    grunt.registerTask('test', [
        'jshint:validate',
        'test-unit'
    ]);

    grunt.registerTask('test-unit', [
        'mochacli:unit'
    ]);
};
