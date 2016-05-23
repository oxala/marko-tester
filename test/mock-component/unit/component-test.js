'use strict';

var componentTest = require('../../../').unit;
var renderer = require('../../renderer').renderer;
var componentRendererTest = componentTest.forRenderer(renderer);
var testCasesDirectory = __dirname + '/../fixtures/';

describe('mock component test', function () {
    componentRendererTest.shouldRenderTheExpectedContentForAllTestCasesIn(testCasesDirectory);
});
