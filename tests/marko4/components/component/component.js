const util = require('../../../common/components/non-marko');

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

  changeInput(event) {
    if (event.keyCode === 13) {
      this.state.hidden = true;

      event.preventDefault();
    }
  },

  documentClick() {
    this.emit('document');
  },
};
