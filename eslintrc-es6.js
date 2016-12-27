module.exports = {
  "extends": [
    "eslint-config-ebay-common",
    "./eslintrc"
  ].map(require.resolve),

  "rules": {
    "import/no-extraneous-dependencies": [ "error", {
      "devDependencies": [
        "test/*",
        "**/*.spec.js"
      ]
    }]
  }
};
