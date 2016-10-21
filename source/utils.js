'use strict';

var path = require('path');
var stackTrace = require('stack-trace');
var rootPath = process.cwd();
var _ = require('lodash');

module.exports = {
  generateBrowserDependencies: function generateBrowserDependencies(dependencies) {
    if (!dependencies || !dependencies.length) {
      return;
    }

    var dependenciesArray = dependencies;

    if (!_.isArray(dependencies)) {
      dependenciesArray = [dependencies];
    }

    dependenciesArray.forEach(function resolveDependency(component) {
      if (_.isObject(component)) {
        global.markoTesterHelpers.rendererPaths.push(component);
      } else {
        var componentPath = path.isAbsolute(component) ? component : path.join(rootPath, component);

        componentPath = path.relative(__dirname, componentPath);

        global.markoTesterHelpers.rendererPaths.push('require: ' + componentPath);
      }
    });
  },

  getTestPath: function getTestPath(stackTraceArray) {
    /* eslint no-param-reassign: 0 */
    if (!stackTraceArray) {
      stackTraceArray = stackTrace.get();
    }

    var trace = stackTraceArray.shift();

    if (trace) {
      var fileName = trace.getFileName();

      if (/^.*\.spec\.js$/.test(fileName)) {
        return path.resolve(fileName, '..');
      }

      return this.getTestPath(stackTraceArray);
    }

    return null;
  },

  getParamsToApply: function getParamsToApply(fn, context) {
    var paramString = fn.toString().match(/function[^(]*\(([^)]*)\)/)[1];

    var paramList = paramString.split(',').map(function mapContextValueForKey(key) {
      return context[key.trim()];
    });

    return paramList;
  }
};
