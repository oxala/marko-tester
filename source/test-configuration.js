'use strict';

require('marko/node-require').install();

var path = require('path');
var fs = require('fs-extra');
var chai = require('chai');
var jsdom = require('jsdom');
var markoCompiler = require.main.require('marko/compiler');
var lasso = require('lasso');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var testFixtures = require('./test-fixtures');
var staticDir = 'static';
var rootPath = process.cwd();

global.expect = chai.expect;
global.sinon = require('sinon');
global._ = require('lodash');

chai.use(sinonChai);
chai.use(chaiAsPromised);

var outputPath = path.join(__dirname, 'generated-tests');
var staticPath = path.join(outputPath, staticDir);

try {
    fs.mkdirsSync(outputPath);
} catch (e) {}

lasso.configure({
    outputDir: staticPath,
    plugins: [
        'i18n-ebay/optimizer/plugin',
        'lasso-marko',
        'lasso-less'
    ],
    urlPrefix: './' + staticDir,
    fingerprintsEnabled: false,
    bundlingEnabled: false
});

module.exports.onInit = function onInit() {};
module.exports.onDestroy = function onDestroy() {};

module.exports.configure = function testConfigure(config) {
    var dependencies = [
        'mocha/mocha.js',
        'require-run: ./mocha-setup',
        { 'path': 'jquery/dist/jquery.js', 'mask-define': true },
        { 'path': 'sinon/pkg/sinon.js', 'mask-define': true }
    ];

    (config.components || []).forEach(function (component) {
        component = path.relative(__dirname, rootPath + '/' + component);

        dependencies.push(component);
    });

    dependencies.push('require-run: ./mocha-runner');

    var browserJSON = {
        dependencies: dependencies
    };

    fs.writeFileSync(path.resolve(__dirname, './browser.json'), JSON.stringify(browserJSON));

    (config.taglibExcludeDirs || []).forEach(function (dirPath) {
        dirPath = path.resolve(rootPath, dirPath);

        markoCompiler.taglibFinder.excludeDir(dirPath);
    });

    (config.taglibExcludePackages || []).forEach(function (packageName) {
        markoCompiler.taglibFinder.excludePackage(packageName);
    });

    (config.excludedAttributes || []).forEach(function (attr) {
        attr = attr.toLowerCase();

        testFixtures.excludeAttribute(attr);
    });

    if (config.onInit) {
        module.exports.onInit = config.onInit;
    }

    if (config.onDestroy) {
        module.exports.onDestroy = config.onDestroy;
    }

    module.exports.buildPage = new Promise(function (resolve, reject) {
        var htmlPath = path.join(outputPath, 'component-tests.html');
        var out = fs.createWriteStream(htmlPath, 'utf8');

        require('./test-scaffold.marko')
            .render({}, out)
            .on('finish', function () {
                jsdom.env(
                    htmlPath, [], {
                        features: {
                            FetchExternalResources: ['script']
                        }
                    },
                    function (err, window) {
                        if (err) {
                            return reject(err);
                        }

                        global.window = window;
                        global.$ = window.jQuery;
                        window.console = console;

                        resolve(window);
                    }
                );
            });
    });
};
