module.exports = {
  "extends": [
    "eslint-config-marko-tester",
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
