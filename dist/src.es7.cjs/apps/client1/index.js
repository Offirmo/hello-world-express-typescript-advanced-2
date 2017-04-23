"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const globals_1 = require("../../globals");
const server_rendered_index_1 = require("./server-rendered-index");
const defaultDependencies = {
    logger: console,
};
function factory(dependencies = {}) {
    const { logger } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from an app!');
    const preRenderedHtml = server_rendered_index_1.factory({ logger });
    //const router = express.Router()
    const app = express();
    // https://expressjs.com/en/guide/using-template-engines.html
    app.engine('dust', globals_1.consolidatedTemplates.dust); // *.dust templates will be rendered with...
    app.set('view engine', 'dust'); // default extension to use when omitted
    app.set('views', path.join(__dirname, 'templates')); // views directory : from base dir, defaults to /views
    // https://expressjs.com/en/starter/static-files.html
    // REM: respond with index.html when a GET request is made to the homepage
    app.use(express.static(path.join(__dirname, 'public')));
    // TODO populate initial datas !
    app.get('/', (req, res) => void res.render('index', { preRenderedHtml }));
    return app;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map