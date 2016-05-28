'use strict';

var fs = require('fs');
var path = require('path');
var Normalizer = require('html-normalizer');

module.exports = function testFixtures(component, testCasesDirectory) {
    var testCases = [];

    fs.readdirSync(testCasesDirectory).forEach(buildCases);

    testCases.forEach(createTest);

    function buildCases(file) {
        var absPath = path.join(testCasesDirectory, file);
        var extension = path.extname(absPath);
        var testName = path.basename(absPath, '.json');

        if (extension === '.json') {
            var fixture = JSON.parse(fs.readFileSync(absPath, 'utf-8'));
            var expectedHtml = fs.readFileSync(absPath.replace(/.json$/, '.html'), 'utf-8');

            testCases.push({
                name: testName,
                fixture: fixture,
                expectedHtml: expectedHtml,
                component: component
            });
        }
    }
};

function createTest(testCase) {
    describe('When component is rendered in "' + testCase.name + '" case', function () {
        var actualHtml;
        var expectedHtml;

        beforeEach(function (done) {
            testCase.component.render(testCase.fixture, function (err, result) {
                actualHtml = result.html.trim();
                actualHtml = (actualHtml ? normalizer().domString(actualHtml) : '');

                expectedHtml = testCase.expectedHtml.trim();
                expectedHtml = (expectedHtml ? normalizer().domString(expectedHtml) : '');

                done();
            });
        });

        it('should render component with a specified html', function () {
            expect(actualHtml).to.equal(expectedHtml);
        });
    });
}

function normalizer() {
    var COMPARE_ALL_ATTRIBUTES_STYLES_AND_CLASSES = {
        attributes: null,
        styles: null,
        classNames: null
    };

    return new Normalizer(COMPARE_ALL_ATTRIBUTES_STYLES_AND_CLASSES);
}
