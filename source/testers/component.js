'use strict';

const _ = require('lodash');
const utils = require('../utils');
const path = require('path');
const deepClone = require('just-clone');

const buildComponent = (mochaAction, context, describeText = '', options, callback) => {
  mochaAction(`When component is being built: ${describeText}`, function whenComponentIsBeingBuild() {
    this.timeout(utils.config.componentTimeout);

    if (!context.modulePath) {
      let modulePath = utils.addBrowserDependency();
      let renderer = require(path.join(utils.config.rootPath, modulePath));

      if (renderer.meta.legacy && renderer.meta.component) {
        modulePath = path.relative(process.cwd(), path.join(utils.testPath, '..', renderer.meta.component));
      }

      context.modulePath = utils.getStaticModule(modulePath);
    }

    before((done) => {
      context.preparePage()
        .then(() => {
          if (options.mock) {
            utils.mockBrowser(options.mock, context);
          }
        })
        .then(done);
    });

    beforeEach((done) => {
      const fixture = options.fixture || _.get(context, 'fixtures.default', {});

      window.$_mod.require(context.modulePath)
        .render(deepClone(fixture), (err, renderResult) => {
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
        utils.unmockBrowser(options.mock, context);
      }
    });
  });
};

module.exports = buildComponent;
