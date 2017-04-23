"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../../globals");
const ReactDOM = require("react-dom/server");
const hCardComponent = require('./public/main').default;
const defaultDependencies = {};
function factory(dependencies = {}) {
    const {} = Object.assign({}, defaultDependencies, dependencies);
    const hCardProps = {
        givenName: 'Sam',
        surname: 'Fairfax',
        email: 'sam.fairfax@fairfaxmedia.com.au',
        phone: '0292822833',
        houseNumber: '100',
        street: 'Harris Street',
        suburb: 'Pyrmont',
        state: 'NSW',
        postcode: '2009',
        country: 'Australia'
    };
    const hCardElement = globals_1.React.createElement(hCardComponent, hCardProps);
    return ReactDOM.renderToString(hCardElement);
}
exports.factory = factory;
//# sourceMappingURL=server-rendered-index.js.map