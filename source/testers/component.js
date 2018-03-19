'use strict';

const _ = require('lodash');
const utils = require('../utils');

const buildComponent = (mochaAction, context, options, callback) => {
  mochaAction('When component is being built', () => {
    if (!context.modulePath) {
      context.modulePath = utils.getStaticModule(utils.addBrowserDependency());
    }

    before((done) => {
      context.preparePage()
        .then(() => {
          if (options.mock) {
            utils.mockBrowser(options.mock);
          }
        })
        .then(done);
    });

    beforeEach((done) => {
      const fixture = options.fixture || _.get(context, 'fixtures.default', {});

      window.$_mod.require(context.modulePath)
        .render(fixture, (err, renderResult) => {
          if (err) {
            done(new Error(`BuildComponent: ${err}`));
          }

          const layout = options.layout || 'container';
          const componentContainer = window[`component-${layout}`];

          context.marko.component = renderResult.appendTo(componentContainer).getComponent();

          done();
        });
    });

    callback && callback({
      marko: context.marko
    });

    afterEach(() => {
      utils.config.onDestroy();
      context.marko.component.destroy();
    });

    after(() => {
      if (options.mock) {
        utils.unmockBrowser(context, options.mock);
      }
    });
  });
};

module.exports = buildComponent;
