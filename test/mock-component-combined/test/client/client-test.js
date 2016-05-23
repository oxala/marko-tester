'use strict';

var helpers = require('../../../../client-helpers');
var component = require('../../');
var fixture = require('../fixtures/html-content');

describe('mock-component-combined test', function () {
    var renderConfig = {
        component: component,
        fixture: fixture
    };

    describe('When widget is being instanstiated', function () {
        beforeEach(function () {
            sinon.stub(window, 'alert');
        });

        afterEach(function () {
            window.alert.restore();
        });

        helpers.setup(renderConfig);

        it('should alert the user', function () {
            expect(window.alert).to.be.called;
        });
    });
});
