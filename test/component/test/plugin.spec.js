'use strict';

var tester = require('../../../');
var component = require('../');

var testCasesPath = __dirname + '/fixtures';

describe('plugin test', function () {
    tester.testFixtures(component, testCasesPath);
    tester.buildComponent();

    describe('When widget is rendered', function () {
        tester.buildWidget();

        it('should load the body', function () {
            expect($('body').hasClass('loaded')).to.be.true;
        });
    });
});
