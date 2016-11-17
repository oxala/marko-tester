'use strict';

var webdriverio = require('webdriverio');
var selenium = require('selenium-standalone');
var utils = require('../utils');
var seleniumProcess;
var browser;

function buildAcceptance() {
  browser = webdriverio.remote({
    baseUrl: utils.getHelpers().config.acceptance.baseUrl
  }).init({
    browserName: 'firefox'
  });

  return browser;
}

function teardown(done) {
  if (browser) {
    browser.end();
  }

  setTimeout(function stopSelenium() {
    if (seleniumProcess) {
      seleniumProcess.kill();
    }

    done();
  }, 500);
}

function setup(done) {
  var seleniumConfig = {
    baseURL: 'https://selenium-release.storage.googleapis.com',
    version: '3.0.1',
    drivers: {
      chrome: {
        version: '2.25',
        arch: process.arch,
        baseURL: 'https://chromedriver.storage.googleapis.com'
      },
      firefox: {
        version: '0.11.1',
        arch: process.arch,
        baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
      }
    }
  };

  selenium.install(seleniumConfig, function startSelenium() {
    selenium
      .start(seleniumConfig, function storeSelenium(err, proc) {
        seleniumProcess = proc;

        done();
      });
  });

  process.on('SIGINT', function terminate(code) {
    teardown(function exitAcceptance() {
      process.exit(code);
    });
  });
}

buildAcceptance.getConfig = function getConfig() {
  return utils.getHelpers().config.acceptance;
};

module.exports = buildAcceptance;
module.exports.setup = setup;
module.exports.teardown = teardown;
