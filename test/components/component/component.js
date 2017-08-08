'use strict';

require('./util');

module.exports = class {
  onCreate() {
    console.log('zzzzzzzzzz');
    this.state = {
      hello: 'hello'
    };
  }

  onMount() {
    console.log(`HERE???? ${document.location.replace}`);
    document.location.replace();
  }

  changeState() {
    this.state.hello = 'world';
  }
};
