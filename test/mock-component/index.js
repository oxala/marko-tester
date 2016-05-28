'use strict';

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getInitialState: function getInitialState(input) {
        return {
            viewModel: input.viewModel,
            config: input.config
        };
    },

    getTemplateData: function getTemplateData(state, input) {
        return state;
    },

    init: function init() {
        window.alert();
    }
});
