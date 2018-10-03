const util = require('../../../common/components/non-marko');

module.exports = {
  onMount() {
    this.util = util;
  },

  onClick(message, event, element) {
    this.emit(message, event, element);
  },
};
