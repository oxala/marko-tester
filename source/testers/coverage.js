'use strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const istanbul = require('istanbul');
const utils = require('../utils');
const instrumenter = require('istanbul-lib-instrument').createInstrumenter();

const preparePathForIgnore = prependPath => ignoredPath => path.resolve(prependPath, ignoredPath, '**');

module.exports.initializeServer = () => {
  global.__coverage__ = {};
  global.__coverage__browser = [];

  const coverageFiles = [];

  utils.sourcePaths.forEach((sourcePath) => {
    coverageFiles.push(...glob.sync(path.resolve(utils.config.rootPath, sourcePath, '**/*.js'), {
      ignore: utils.config.coverage.excludes.map(preparePathForIgnore(utils.config.rootPath))
    }));
  });

  coverageFiles.forEach((filePath) => {
    instrumenter.instrumentSync(
      fs.readFileSync(filePath, 'utf8'),
      filePath
    );

    global.__coverage__[filePath] = instrumenter.lastFileCoverage();
  });

  istanbul.hook.hookRequire(
    requirePath => coverageFiles.indexOf(requirePath) > -1,
    (code, requirePath) => instrumenter.instrumentSync(code, requirePath)
  );

  process.on('exit', () => {
    const reporters = utils.config.coverage.reporters;
    const dest = utils.config.coverage.dest;
    const collector = new istanbul.Collector();

    collector.add(global.__coverage__);
    global.__coverage__browser.forEach(coverage => collector.add(coverage));

    reporters.forEach(reporter =>
      istanbul.Report.create(reporter, {
        dir: `${dest}/${reporter}`
      }).writeReport(collector, true)
    );
  });
};
module.exports.initializeBrowser = () => {
  const bundleBasePath = path.resolve(utils.config.outputPath, 'source');
  const bundlePath = path.resolve(bundleBasePath, utils.config.bundleName);

  utils.sourcePaths.forEach((sourcePath) => {
    const generatedSrcPath = path.resolve(bundlePath, sourcePath);
    const files = glob.sync(path.resolve(generatedSrcPath, '**/*.js'), {
      ignore: utils.config.coverage.excludes.map(preparePathForIgnore(bundlePath))
    });

    files.forEach((filePath) => {
      const coveragePath = path.resolve(utils.config.rootPath, sourcePath);
      const realPath = filePath.replace(generatedSrcPath, coveragePath);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      let moduleBody = fileContent;
      let startIndex;
      let endIndex;

      if (fileContent.substring(0, 10) === '$_mod.def(') {
        startIndex = fileContent.indexOf('{') + 1;
        endIndex = fileContent.lastIndexOf('}');

        moduleBody = fileContent.substring(startIndex, endIndex);
      }

      try {
        JSON.parse(`{${moduleBody}}`);
      } catch (e) {
        const instrumentedModuleBody = instrumenter.instrumentSync(moduleBody, realPath);

        fileContent = `${fileContent.substring(0, startIndex)}${instrumentedModuleBody}});`;

        fs.writeFileSync(filePath, fileContent, 'utf8');
      }
    });
  });
};
