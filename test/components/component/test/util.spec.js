// 'use strict';

// var tester = require('../../../../');

// tester('util', (buildPage, expect, sinon, modRequire) => {
//   buildPage(function () {
//     var util;
//     var hello;
//     var result;

//     beforeEach(function () {
//       hello = 'world';
//       sinon.stub(window, 'alert');

//       util = modRequire('test/components/component/util');

//       result = util(hello);
//     });

//     afterEach(function () {
//       window.alert.restore();
//     });

//     it('should alert the window', function () {
//       expect(window.alert).to.be.calledWith(hello);
//     });

//     it('should return $', function () {
//       expect(result).to.be.equal('$');
//     });
//   });
// });
