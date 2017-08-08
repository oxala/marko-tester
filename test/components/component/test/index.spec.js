'use strict';

global.tester('component', (testFixtures, buildComponent, context, buildPage, expect, sinon) => {
  // testFixtures();

  buildPage(() => {
    beforeEach(() => {
      sinon.stub(document.location, 'replace');
      // console.log('????', document.location.replace);
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    buildComponent(() => {
      it('should alert the user', () => {
        expect(document.location.replace).to.be.called;
      });

      describe('When user clicks the button', () => {
        beforeEach(() => {
          console.log('document.body.querySelector', document.body.innerHTML);
          document.body.querySelector('button').click();
        });

        it('should change the state', () => {
          expect(context.component.state.hello).to.be.equal('world');
        });
      });
    });
  });
});
