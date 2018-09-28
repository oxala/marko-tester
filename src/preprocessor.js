const { taglibFinder, taglibLookup, compileFile } = require('marko/compiler');
const { markoVersion } = require('./versions');

module.exports = {
  process(src, filepath, { globals = {} }) {
    const { tester = {} } = globals;
    const { shallow = true } = tester;

    if (shallow) {
      if (markoVersion === 3) {
        try {
          taglibLookup.registerTaglib(require.resolve('marko-widgets/marko'));
        } catch (error) {
          console.warn('No marko-widgets were found.');
        }
      }

      taglibFinder.find = (a, b) => b;
    }

    return (markoVersion === 3)
      ? compileFile(filepath)
      /* eslint-disable-next-line global-require, import/no-unresolved */
      : require('marko/compiler').compileFileForBrowser(filepath, {
        ignoreUnrecognizedTags: true,
        escapeAtTags: true,
      });
  },
};
