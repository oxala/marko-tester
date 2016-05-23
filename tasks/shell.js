'use strict';

module.exports = function shell(grunt) {
    grunt.loadNpmTasks('grunt-shell');

    return {
        'test-client': {
            command: 'npm run test-client'
        }
    };
};
