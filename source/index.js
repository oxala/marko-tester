/* globals _ */
'use strict';

var testConfiguration = require('./test-configuration');
var testFixtures = require('./test-fixtures');
var jsdom = require('jsdom');
var template = require('./test-scaffold.marko');

module.exports.configure = testConfiguration.configure;
module.exports.testFixtures = testFixtures;
module.exports.buildComponent = buildComponent;
module.exports.buildWidget = buildWidget;

var buildPage = new Promise(function (resolve, reject) {
    template
        .render({}, testConfiguration.out)
        .on('finish', function () {
            jsdom.env(
                testConfiguration.htmlPath, [], {
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

function buildComponent(settings) {
    beforeEach(function (done) {
        buildPage.then(buildDom);

        function buildDom(window) {
            settings.renderer.render(settings.fixture, function (err, result) {
                if (_.isObject(result)) {
                    result = result.html;
                }

                var componentContainer = window['component-container'];

                componentContainer.innerHTML = result;

                var widgetPath = componentContainer.children[0].getAttribute('data-widget');

                if (widgetPath) {
                    global.widget = window.$rmod.require(widgetPath);

                    testConfiguration.onInit();

                    done();
                }
            });
        }
    });

    afterEach(function () {
        testConfiguration.onDestroy();

        global.widget && global.widget.destroy && global.widget.destroy();
    });
}

function buildWidget() {
    beforeEach(function (done) {
        var widgetId = window['component-container'].children[0].id;

        window.$markoWidgets(widgetId);

        global.widget = window.$MARKO_WIDGETS.getWidgetForEl(widgetId);

        done();
    });
}
