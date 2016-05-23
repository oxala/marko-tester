'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var generator = require('./generator');

module.exports = function testRunner() {
    // var markoTaglibPath = path.join(__dirname, '../../source/marko.json');
    // var markoTaglibPathTemp = markoTaglibPath + '_temp';

    // try {
    //     fs.statSync(markoTaglibPath);
    //     fs.renameSync(markoTaglibPath, markoTaglibPathTemp);
    // } catch (e) {}

    var outputDir = path.join(__dirname, 'generated-tests');
    generator.ensureDirCreated(outputDir);

    require('lasso').configure(
        generator.defaultOptimizerConfig({
            outputDir: outputDir
        })
    );

    var htmlPath = path.join(outputDir, 'component-tests.html');
    var out = fs.createWriteStream(htmlPath, 'utf8');
    var template = require('./test-scaffold.marko');

    template
        .render({}, out)
        .on('finish', function () {
            spawn('mocha-phantomjs', [htmlPath], { stdio: 'inherit' })
                .on('close', function (code) {
                    // try {
                    //     fs.statSync(markoTaglibPathTemp);
                    //     fs.renameSync(markoTaglibPathTemp, markoTaglibPath);
                    // } catch (e) {}

                    process.exit(code);
                });
        });
};
