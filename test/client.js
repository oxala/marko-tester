'use strict';

var componentTest = require('../').client;

componentTest.configure({
    testCases: [
        'test/**/test/client/client-test.js'
    ]
});

componentTest.run();
