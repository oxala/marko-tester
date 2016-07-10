'use strict';

module.exports = {
  "viewModel": {
    "placement": "test",
    "title": "Hello, World!",
    "content": "Some plain text"
  },
  "config": {
    "url": "www.ebay.com",
    "locale": "en_US",
    "timeout": 1000,
    "isDev": true
  },
  "tracking": {
    "spTag": function () {
      return {
        "moduleId": function (moduleId) {
          return {
            "linkId": function (linkId) {
                return moduleId + linkId;
            }
          };
        }
      };
    }
  },
  "content": {
    "get": function (key) {
      return key;
    }
  }
}
