const { taglibFinder, taglibLookup, compileFile } = require('marko/compiler');
const { markoVersion, markoWidgetsVersion } = require('./versions');

module.exports = {
  process(src, filepath, { globals = {} }) {
    const { tester = {} } = globals;
    const { shallow = true } = tester;

    if (shallow) {
      if (markoVersion === 3 && markoWidgetsVersion === 6) {
        taglibLookup.registerTaglib(require.resolve('marko-widgets/marko'));
      }

      taglibFinder.find = (a, b) => b;
    }

    return markoVersion === 3 && markoWidgetsVersion === 6
      ? compileFile(filepath)
      /* eslint-disable-next-line global-require, import/no-unresolved */
      : require('marko/compiler').compileFileForBrowser(filepath, {
        ignoreUnrecognizedTags: true,
        escapeAtTags: true,
      });
  },
};
