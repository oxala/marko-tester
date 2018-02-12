'use strict';

const _ = require('lodash');
const utils = require('../utils');

const buildComponent = (context, opts, cb) => {
  const callback = cb || opts;
  const options = cb ? opts : {};

  options.mochaOperation('When component is being built', () => {
    if (!context.modulePath) {
      context.modulePath = utils.getStaticModule(utils.addBrowserDependency());
    }

    before((done) => {
      context.preparePage()
        .then(() => {
          if (options.mock) {
            utils.mockBrowser(context, options.mock);
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

    callback.call(this);

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

module.exports = utils.runWithMochaOperation.bind(null, null, buildComponent);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', buildComponent);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', buildComponent);
