'use strict';

module.exports = function mochacli(grunt) {
    grunt.loadNpmTasks('grunt-mocha-cli');

    var unitTestSources = [
        'test/index.spec.js',
        'test/**/test/index.spec.js'
    ];

    return {
        options: {
            timeout: 120000,
            ignoreLeaks: false,
            ui: 'bdd',
            reporter: 'spec',
            grep: grunt.option('grep')
        },
        unit: unitTestSources,
        report: {
            src: unitTestSources,
            options: {
                reporter: 'xunit',
                save: 'mocha.xunit',
                force: true
            }
        }
    };
};
