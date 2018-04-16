'use strict';

const _ = require('lodash');
const utils = require('../utils');
const sinon = require('sinon');

const buildComponent = (mochaAction, context, describeText = '', options, callback) => {
  mochaAction(`When component is being built: ${describeText}`, function whenComponentIsBeingBuild() {
    this.timeout(utils.config.componentTimeout);

    if (!context.modulePath) {
      context.modulePath = utils.getStaticModule(utils.addBrowserDependency());
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
        .render(fixture, (err, renderResult) => {
          if (err) {
            done(new Error(`BuildComponent: ${err}`));
          }

          const layout = options.layout || 'container';
          const componentContainer = window[`component-${layout}`];

          context.marko.component = renderResult.appendTo(componentContainer).getComponent();

          if (context.marko.component.emit) {
            sinon.spy(context.marko.component, 'emit');
          }

          if (context.marko.component.forceUpdate) {
            sinon.spy(context.marko.component, 'forceUpdate');
          }

          if (context.marko.component.update) {
            sinon.spy(context.marko.component, 'update');
          }

          if (context.marko.component.rerender) {
            sinon.spy(context.marko.component, 'emit');
          }

          done();
        });
    });

    callback && callback({
      marko: context.marko
    });

    afterEach(() => {
      if (context.marko.component.emit) {
        context.marko.component.emit.restore();
      }

      if (context.marko.component.forceUpdate) {
        context.marko.component.forceUpdate.restore();
      }

      if (context.marko.component.update) {
        context.marko.component.update.restore();
      }

      if (context.marko.component.rerender) {
        context.marko.component.rerender.restore();
      }

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
