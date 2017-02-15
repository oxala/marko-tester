module.exports = {
  "extends": [
    "eslint-config-ebay-common/legacy",
    "./eslintrc"
  ].map(require.resolve)
};
