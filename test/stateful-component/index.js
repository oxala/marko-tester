'use strict';

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getInitialState: function getInitialState (input) {
      return input;
    }
});
