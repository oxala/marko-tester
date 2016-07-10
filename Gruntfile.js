'use strict';

module.exports = function (grunt) {
    require('grunt-config-dir')(grunt, {
        configDir: require('path').join(__dirname, 'tasks')
    });

    grunt.registerTask('lint', [
        'jshint:validate'
    ]);

    grunt.registerTask('test', [
        'mochacli:unit',
    ]);
};


