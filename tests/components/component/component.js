const util = require('../non-marko');

module.exports = {
  onCreate(input) {
    this.state = {
      hidden: input.hidden,
    };

    Object.assign(input, { hello: 'world' });
  },

  onMount() {
    this.util = util;
  },

  changeInput() {
    this.state.hidden = true;
  },
};
