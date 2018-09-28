const serviceCall = require('./service');

module.exports = {
  handledPromise: () => serviceCall.get()
    .then(response => Object.assign({ success: true }, response))
    .catch(response => Object.assign({ fail: true }, response)),
  unhandledPromise: () => serviceCall.get(),
};
