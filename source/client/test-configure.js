'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function testConfigure(config) {
    var dependencies = [
        'mocha/mocha.js',
        'require-run: ./mocha-setup',
        'require: jquery',
        { 'path': 'sinon/pkg/sinon.js', 'mask-define': true }
    ];

    config.testCases.forEach(function (testPath) {
        testPath = path.relative(__dirname, process.cwd() + '/' + testPath);

        dependencies.push('require-run: ' + testPath);
    });

    dependencies.push('require-run: ./mocha-runner');

    var browserJSON = {
        dependencies: dependencies
    };

    fs.writeFileSync(path.resolve(__dirname, './browser.json'), JSON.stringify(browserJSON));
};
