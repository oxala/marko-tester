'use strict';

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getInitialState: function(input) {
        return {
            viewModel: input.viewModel,
            config: input.config
        };
    },

    getTemplateData: function(state, input) {
        return {
            viewModel: state.viewModel,
            config: state.config
        };
    },

    init: function() {
        window.alert();
    }
});
