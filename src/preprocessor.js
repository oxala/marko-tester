const {
  taglibFinder,
  taglibLookup,
  compile,
  taglibLoader,
  compileForBrowser,
} = require('marko/compiler');
const { resolve } = require('path');
const { markoVersion } = require('./versions');

const discoverTaglibs = (taglibs) => {
  taglibs
    .reduce((taglibPaths, taglibPath) => {
      const taglibJsonPath = `${taglibPath}/marko.json`;

      try {
        return taglibPaths.concat(require.resolve(taglibJsonPath));
      } catch (error) {
        try {
          return taglibPaths.concat(require.resolve(resolve(process.cwd(), taglibJsonPath)));
        } catch (error2) {
          console.warn('No marko taglib was found for:', taglibJsonPath);

          return taglibPaths;
        }
      }
    }, [])
    .forEach((resolvedTaglibPath) => {
      const taglib = (taglibLoader.createTaglib || taglibLoader.load)(resolvedTaglibPath);

      if (markoVersion === 4) {
        /* eslint-disable-next-line global-require, import/no-dynamic-require */
        taglibLoader.loadTaglibFromProps(taglib, require(taglib.path));
      }

      taglibLookup.registerTaglib(taglib);
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
      ? compile(src, filepath)
      : compileForBrowser(src, filepath, {
        ignoreUnrecognizedTags: true,
        escapeAtTags: true,
      });
  },
};
