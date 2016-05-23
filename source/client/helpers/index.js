'use strict';

module.exports.renderWidget = renderWidget;
module.exports.destroyWidget = destroyWidget;
module.exports.setup = setup;

function renderWidget(renderConfig) {
    return function () {
        window.widget = renderConfig.component
            .render(renderConfig.fixture)
            .replaceChildrenOf(document.getElementById('component-container'))
            .getWidget();
    };
}

function destroyWidget() {
    window.widget.destroy();
}

function setup(renderConfig) {
    beforeEach(renderWidget(renderConfig));
    afterEach(destroyWidget);
}
