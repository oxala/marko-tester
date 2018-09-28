const { defineComponent } = require('marko-widgets');
const template = require('./index.marko');

module.exports = defineComponent({
  template,

  getInitialState: input => input,

  init() {
    window.alert(this.state.visible);
  },

  changeInput() {
    this.setState('visible', false);
  },
});
