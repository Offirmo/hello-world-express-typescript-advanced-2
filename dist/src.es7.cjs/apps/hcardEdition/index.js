"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const globals_1 = require("../../globals");
const server_rendered_index_1 = require("./server-rendered-index");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
async function factory(dependencies = {}) {
    const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Initializing the client1 webapp…');
    if (!userCRUD)
        throw new Error('hCard edition app: can’t work without a persistence layer!');
    const renderedHtmlAsString = (await server_rendered_index_1.factory({ logger })).renderToString;
    const app = express();
    // https://expressjs.com/en/guide/using-template-engines.html
    app.engine('dust', globals_1.consolidatedTemplates.dust); // *.dust templates will be rendered with...
    app.set('view engine', 'dust'); // default extension to use when omitted
    app.set('views', path.join(__dirname, 'templates')); // views directory : from base dir, defaults to /views
    // https://expressjs.com/en/starter/static-files.html
    // REM: respond with index.html when a GET request is made to the homepage
    app.use(express.static(path.join(__dirname, 'public')));
    async function handleAsync(req, res) {
        let userData = await userCRUD.read(req.userId);
        console.log('restoring...', userData);
        //console.log('restoring...', userData, userData!.hCard, userData!.pendingHCardUpdates)
        // TODO restore from live edit !
        let editorHCardData = Object.assign({}, userData.hCard);
        const preRenderedHtml = renderedHtmlAsString(editorHCardData);
        //console.log('restoring...', hCardData, fullHCardData, preRenderedHtml)
        res.render('index', {
            preRenderedHtml,
            hCardData: editorHCardData,
        });
    }
    app.get('/', (req, res, next) => {
        handleAsync(req, res)
            .catch(next);
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map