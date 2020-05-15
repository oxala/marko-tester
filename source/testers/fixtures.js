'use strict';

const Normalizer = require('html-normalizer');
const fs = require('fs-extra');
const chai = require('chai');
const utils = require('../utils');
const diffableHTML = require('diffable-html');

const expect = chai.expect;
const excludedAttributes = utils.config.excludedAttributes.map(attr => attr.toLowerCase());
const cleanRenderedHtml = (html) => {
  let trimmedHtml = (html || '').trim();

  if (trimmedHtml) {
    trimmedHtml = new Normalizer({
      attributes: null,
      attributesExcluded: excludedAttributes,
      styles: null,
      classNames: null
    }).domString(trimmedHtml);

    (trimmedHtml.match(/="{(.+?)(?=(}" |}">))}|="\[(.+?)(?=(]" |]">))]/g) || [])
      .map(i => i.substr(2, i.length))
      .forEach((snippet) => {
        trimmedHtml = trimmedHtml.replace(snippet, snippet.replace(/"/g, '\''))
          .replace(/<\/br>/g, '');
      });
  }

  return diffableHTML(trimmedHtml);
};
const testFixtures = (context, opts) => {
  const options = opts || {};

  if (!context.renderer) {
    Object.assign(context, {
      renderer: utils.renderer
    });
  }

  if (!context.renderer) {
    throw new Error('TestFixtures: Cannot automatically locate renderer, please specify one.');
  }

  const testCases = context.fixturesData.map(fixture => ({
    name: fixture.testName,
    fixture: fixture.data,
    expectedHtml: fixture.expectedHtml,
    absPath: fixture.absPath
  }));

  if (context.options.fixturesPath && !testCases.length) {
    throw new Error('TestFixtures: No fixtures found in specified location');
  }

  options.mochaOperation('Given specific input data', () => {
    testCases.forEach((testCase) => {
      it(`should render component using ${testCase.name} input`, (done) => {
        let expectedHtml = cleanRenderedHtml(testCase.expectedHtml);

        new Promise((resolve, reject) => {
          const callback = (error, result) => {
            if (error) {
              return reject('TestFixtures: Failed to render component html.');
            }

            return resolve(cleanRenderedHtml(result.toString()));
          };

          callback.global = {};
          context.renderer.renderToString(testCase.fixture, callback);
        }).catch((error) => {
          throw new Error(error);
        }).then((actualHtml) => {
          if (utils.options.fixFixtures && actualHtml !== expectedHtml) {
            fs.writeFileSync(testCase.absPath, `${actualHtml}\n`, 'utf-8');
            expectedHtml = actualHtml;
          }

          expect(actualHtml).to.be.equal(expectedHtml);
          done();
        }).catch(done);
      });
    });
  });
};

module.exports = utils.runWithMochaOperation.bind(null, null, testFixtures);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', testFixtures);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', testFixtures);
