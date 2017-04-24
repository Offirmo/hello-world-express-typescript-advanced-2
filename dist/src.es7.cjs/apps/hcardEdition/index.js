"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const hcard_1 = require("../../models/hcard");
const globals_1 = require("../../globals");
const server_rendered_index_1 = require("./server-rendered-index");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
    sharedSessionKeyPendingHCardEdits: 'hcardLiveEdition',
};
async function factory(dependencies = {}) {
    const { logger, userCRUD, sharedSessionKeyPendingHCardEdits } = Object.assign({}, defaultDependencies, dependencies);
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
    app.get('/', (req, res, next) => {
        (async function render() {
            let userData = await userCRUD.read(req.userId);
            const savedHCardData = userData.hCard;
            const pendingHCardData = req.session[sharedSessionKeyPendingHCardEdits] || {};
            let editorHCardData = Object.assign({}, savedHCardData, pendingHCardData);
            const preRenderedHtml = renderedHtmlAsString(editorHCardData);
            res.render('index', {
                preRenderedHtml,
                hCardData: editorHCardData,
            });
        })()
            .catch(next);
    });
    app.post('/update', (req, res, next) => {
        (async function updateHcard() {
            const candidateData = req.body;
            hcard_1.validateKeysOrThrow(candidateData);
            // TODO remove unchanged fields
            req.session[sharedSessionKeyPendingHCardEdits] =
                Object.assign(req.session[sharedSessionKeyPendingHCardEdits] || {}, candidateData);
        })()
            .then(() => void res.end())
            .catch(next);
    });
    app.post('/submit', (req, res, next) => {
        userCRUD.update(req.userId, { hCard: req.body })
            .then(() => {
            req.session[sharedSessionKeyPendingHCardEdits] = {};
            res.send(`
<!DOCTYPE html>
<head>
	<title>Live hCard Preview, by Yves Jutard</title>
	<link href="domain/css/bootstrap.min.css" rel="stylesheet" >
	<link href="domain/css/main.css" rel="stylesheet">
</head>
Saved.<br />
<a href="/domain">Go back to edition</a>
	`);
        })
            .catch(next);
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map