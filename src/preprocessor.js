/* eslint-disable-next-line global-require, import/no-unresolved */
const { taglibFinder, compileFileForBrowser } = require('marko/compiler');

module.exports = {
  process(src, filepath, { globals = {} }) {
    const { tester = {} } = globals;
    const { shallow = true } = tester;

    if (shallow) {
      taglibFinder.find = (a, b) => b;
    }

    return compileFileForBrowser(filepath, { ignoreUnrecognizedTags: true, escapeAtTags: true });
  },
};
