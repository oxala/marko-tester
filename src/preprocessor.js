const {
  taglibFinder,
  taglibLookup,
  compileFile,
  taglibLoader,
  compileFileForBrowser,
} = require('marko/compiler');
const { resolve } = require('path');
const { markoVersion } = require('./versions');

const discoverTaglibs = (taglibs) => {
  taglibs
    .map(taglibPath => `${taglibPath}/marko.json`)
    .map((taglibPath) => {
      try {
        return require.resolve(taglibPath);
      } catch (error) {
        try {
          return require.resolve(resolve(process.cwd(), taglibPath));
        } catch (error2) {
          return console.warn('No marko taglib was found for:', taglibPath);
        }
      }
    })
    .filter(resolvedTaglibPath => !!resolvedTaglibPath)
    .forEach((resolvedTaglibPath) => {
      if (markoVersion === 4) {
        const taglib = taglibLoader.createTaglib(resolvedTaglibPath);

        /* eslint-disable-next-line global-require, import/no-dynamic-require */
        taglibLoader.loadTaglibFromProps(taglib, require(taglib.path));
        taglibLookup.registerTaglib(taglib);
      } else {
        const taglib = taglibLoader.load(resolvedTaglibPath);

        taglibLookup.registerTaglib(taglib);
      }
    });
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
