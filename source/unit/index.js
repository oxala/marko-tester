'use strict';

var fs = require('fs');
var path = require('path');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var Normalizer = require('html-normalizer');

chai.use(sinonChai);

global.expect = chai.expect;

// var markoTaglibPath = path.join(__dirname, '../../source/marko.json');
// var markoTaglibPathTemp = markoTaglibPath + '_temp';

// try {
//     fs.statSync(markoTaglibPath);
//     fs.renameSync(markoTaglibPath, markoTaglibPathTemp);
// } catch (e) {}

// process.on('exit', function () {
//     try {
//         fs.statSync(markoTaglibPathTemp);
//         fs.renameSync(markoTaglibPathTemp, markoTaglibPath);
//     } catch (e) {}
// });

function StringWriter() {
    this.str = '';
    this.global = {};
}

StringWriter.prototype = {
    write: function (str) {
        this.str += str;
        return this;
    },

    end: function () {},

    toString: function () {
        return this.str;
    }
};

module.exports = {
    forRenderer: function (renderer) {
        function getAllTestCasesIn(testCasesDirectory) {
            var testCaseInputExtension = '.json';
            var testCaseOutputExtension = '.html';

            return fs.readdirSync(testCasesDirectory)
                .filter(function (filename) {
                    return path.extname(filename) === testCaseInputExtension;
                })
                .map(function (filename) {
                    var testCaseName = path.basename(filename, testCaseInputExtension);

                    return {
                        name: testCaseName,
                        input: testCasesDirectory + testCaseName + testCaseInputExtension,
                        output: testCasesDirectory + testCaseName + testCaseOutputExtension
                    };
                });
        }

        function testExpectedContentAgainstRenderedContent(testCase) {
            it('should render the expected content for test case: ' + testCase.name, function () {
                expect(renderedHtmlFor(testCase)).to.be.equal(expectedHtmlFor(testCase));
            });
        }

        function renderedHtmlFor(testCase) {
            var input = require(testCase.input);
            var writer = new StringWriter();

            renderer(input, writer);

            var renderedHtml = writer.toString().trim();

            return renderedHtml ? normalizer().domString(renderedHtml) : '';
        }

        function expectedHtmlFor(testCase) {
            var html = fs.readFileSync(testCase.output, 'utf8').trim();

            return html ? normalizer().domString(html) : '';
        }

        function normalizer() {
            var COMPARE_ALL_ATTRIBUTES_STYLES_AND_CLASSES = {
                attributes: null,
                styles: null,
                classNames: null
            };

            return new Normalizer(COMPARE_ALL_ATTRIBUTES_STYLES_AND_CLASSES);
        }

        return {
            shouldRenderTheExpectedContentForAllTestCasesIn: function (testCasesDirectory) {
                getAllTestCasesIn(testCasesDirectory).forEach(testExpectedContentAgainstRenderedContent);
            }
        };
    }
};
