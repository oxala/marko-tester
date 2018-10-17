const {
  taglibFinder,
  taglibLookup,
  compileFile,
  taglibLoader,
  compileFileForBrowser,
} = require('marko/compiler');
const { markoVersion } = require('./versions');

const discoverTaglibs = (taglibs) => {
  if (markoVersion === 4) {
    taglibs
      .map(taglibPath => `${taglibPath}/marko.json`)
      .forEach((taglibPath) => {
        try {
          const taglib = taglibLoader.createTaglib(require.resolve(taglibPath));

          /* eslint-disable-next-line global-require, import/no-dynamic-require */
          taglibLoader.loadTaglibFromProps(taglib, require(taglib.path));
          taglibLookup.registerTaglib(taglib);
        } catch (error) {
          console.warn('No marko taglib was found.', error);
        }
      });
  }
};

const shallowPatch = () => {
  if (markoVersion === 3) {
    try {
      taglibLookup.registerTaglib(require.resolve('marko-widgets/marko'));
    } catch (error) {
      console.warn('No marko-widgets were found.', error);
    }
  }

  taglibFinder.find = (a, b) => b;
};

module.exports = {
  process(src, filepath, { globals = {} }) {
    const { tester = {} } = globals;
    const { shallow = true, taglibs = [] } = tester;

    if (taglibs.length) discoverTaglibs(taglibs);
    if (shallow) shallowPatch();

    return (markoVersion === 3)
      ? compileFile(filepath)
      : compileFileForBrowser(filepath, {
        ignoreUnrecognizedTags: true,
        escapeAtTags: true,
      });
  },
};
