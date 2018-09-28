module.exports = {
  onCreate(input) {
    this.state = {
      hidden: input.hidden,
    };
  },

  changeInput() {
    this.state.hidden = true;
  },
};
