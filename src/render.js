const clone = require('just-clone');
const { markoVersion } = require('./versions');

const mount = comp => comp.appendTo(document.body);
const getWidgetInstance = (renderer, input) => {
  if (/\.marko$/.test(renderer.path)) {
    document.body.insertAdjacentHTML('afterbegin', renderer.renderToString(clone(input)));

    return {
      destroy: () => document.body.childNodes.forEach(node => document.body.removeChild(node)),
    };
  }

  return mount(renderer.renderSync(clone(input))).getWidget();
};
const getComponentInstance = (renderer, input, withAwait) => {
  const mountComponent = comp => mount(comp).getComponent();

  /* eslint-disable-next-line global-require, import/no-unresolved */
  require('marko/components').init();

  return withAwait
    ? renderer.render(clone(input)).then(mountComponent)
    : mountComponent(renderer.renderSync(clone(input)));
};

module.exports = (fullPath, withAwait) => (input) => {
  jest.resetModules();

  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  const renderer = require(fullPath);

  return markoVersion === 3
    ? getWidgetInstance(renderer, input)
    : getComponentInstance(renderer, input, withAwait);
};
