'use strict';

var tester = require('../../../');
var component = require('../');

var testCasesPath = __dirname + '/fixtures';

describe('excluded-component test', function () {
    tester.testFixtures(component, testCasesPath);
});
