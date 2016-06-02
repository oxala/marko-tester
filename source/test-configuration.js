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

        removeTaglib(dirPath);
    });

    (config.taglibExcludePackages || []).forEach(function (packageName) {
        var dirPath = path.resolve(rootPath, 'node_modules/' + packageName);

        removeTaglib(dirPath);
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

function removeTaglib(taglibPath) {
    var markoTaglibPath = path.join(taglibPath, 'marko.json');
    var markoTaglibPathTemp = markoTaglibPath + '_temp';

    try {
        fs.statSync(markoTaglibPath);
        fs.renameSync(markoTaglibPath, markoTaglibPathTemp);
    } catch (e) {}

    process.on('exit', function () {
        try {
            fs.statSync(markoTaglibPathTemp);
            fs.renameSync(markoTaglibPathTemp, markoTaglibPath);
        } catch (e) {}
    });
}
