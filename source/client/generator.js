'use strict';

var fs = require('fs-extra');
var path = require('path');

module.exports = {
    ensureDirCreated: function (path) {
        try {
            fs.mkdirsSync(path);
        } catch (e) {
            // Ignore the error if the directory already exists
        }
    },

    defaultOptimizerConfig: function (params) {
        var outputDir = params.outputDir;
        var staticDir = path.join(outputDir, 'static');

        return {
            outputDir: staticDir,
            plugins: [
                'lasso-marko',
                'lasso-less'
            ],
            urlPrefix: './static',
            fingerprintsEnabled: false,
            bundlingEnabled: false
        };
    }
};
