"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../../globals");
const ReactDOM = require("react-dom/server");
const hCardComponent = require('./public/main').default;
const defaultDependencies = {};
function factory(dependencies = {}) {
    const {} = Object.assign({}, defaultDependencies, dependencies);
    function renderToString(props) {
        const hCardElement = globals_1.React.createElement(hCardComponent, props);
        return ReactDOM.renderToString(hCardElement);
    }
    return {
        renderToString
    };
}
exports.factory = factory;
//# sourceMappingURL=server-rendered-index.js.map