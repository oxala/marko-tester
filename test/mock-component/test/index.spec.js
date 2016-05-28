'use strict';

var tester = require('../../../');
var component = require('../');

var testCasesPath = __dirname + '/fixtures';

describe('mock-component-combined test', function () {
    var settings = {
        renderer: component.renderer,
        fixture: require('./fixtures/html-content')
    };

    tester.testFixtures(component, testCasesPath);

    tester.buildComponent(settings);

    describe('When widget is rendered', function () {
        beforeEach(function () {
            sinon.stub(window, 'alert');
        });

        afterEach(function () {
            window.alert.restore();
        });

        tester.buildWidget();

        it('should alert the user', function () {
            expect(window.alert).to.be.called;
        });
    });
});
