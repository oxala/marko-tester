'use strict';

var componentTest = require('../../../../').unit;
var renderer = require('../../index').renderer;
var componentRendererTest = componentTest.forRenderer(renderer);
var testCasesDirectory = __dirname + '/../fixtures/';

describe('mock-component-combined test', function () {
    componentRendererTest.shouldRenderTheExpectedContentForAllTestCasesIn(testCasesDirectory);
});
