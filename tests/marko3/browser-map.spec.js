const browserMap = require('../../src/browser-map');

it('should construct marko 3 browser-map', () => {
  expect(browserMap).toEqual({
    'marko-widgets/lib/defineWidget.js': 'marko-widgets/lib/defineWidget-browser.js',
    'marko-widgets/lib/index.js': 'marko-widgets/lib/index-browser.js',
    'marko-widgets/lib/init-widgets.js': 'marko-widgets/lib/init-widgets-browser.js',
    'marko-widgets/lib/uniqueId.js': 'marko-widgets/lib/uniqueId-browser.js',
    'marko-widgets/taglib/getRequirePath.js': 'marko-widgets/taglib/getRequirePath-browser.js',
    'marko-widgets/test/util/autotest/node-require.js': '../src/noop.js',
    'marko/compiler/taglib-finder/index.js': 'marko/compiler/taglib-finder/index-browser.js',
    'marko/compiler/taglib-loader/json-file-reader.js': 'marko/compiler/taglib-loader/json-file-reader-browser.js',
    'marko/compiler/taglib-loader/scanTagsDir.js': 'marko/compiler/taglib-loader/scanTagsDir-browser.js',
    'marko/compiler/util/deresolve.js': 'marko/compiler/util/deresolve-browser.js',
    'marko/compiler/util/resolve.js': 'marko/compiler/util/resolve-browser.js',
    'marko/runtime/loader/index.js': 'marko/runtime/loader/index-browser.js',
    'marko/runtime/stream/index.js': 'marko/runtime/stream/index-browser.js',
    'marko/taglibs/async/client-reorder.js': 'marko/taglibs/async/client-reorder-browser.js',
    'marko/taglibs/core/include-html-tag.js': 'marko/taglibs/core/include-html-tag-browser.js',
    'marko/taglibs/core/include-text-tag.js': 'marko/taglibs/core/include-text-tag-browser.js',
    'raptor-dom/raptor-dom-server.js': 'raptor-dom/raptor-dom-client.js',
    'raptor-renderer/lib/RenderResult.js': 'raptor-renderer/lib/RenderResult-browser.js',
  });
});
