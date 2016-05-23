'use strict';

module.exports = function (grunt) {
    require('grunt-config-dir')(grunt, {
        configDir: require('path').join(__dirname, 'tasks')
    });

    grunt.registerTask('test', [
        'jshint:validate',
        'test-unit',
        'test-client'
    ]);

    grunt.registerTask('test-unit', [
        'mochacli:unit'
    ]);

    grunt.registerTask('test-client', [
        'shell:test-client'
    ]);
};
