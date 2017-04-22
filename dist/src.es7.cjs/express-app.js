"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sub_app_1 = require("./routes/sub-app");
const defaultDependencies = {
    logger: console,
};
function factory(dependencies = {}) {
    const { logger } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from express app!');
    const app = express();
    // https://expressjs.com/en/4x/api.html#app.settings.table
    app.enable('trust proxy');
    app.disable('x-powered-by'); // safety
    // https://expressjs.com/en/starter/static-files.html
    // REM: respond with index.html when a GET request is made to the homepage
    app.use(express.static('public'));
    // respond with "hello world" when a GET request is made to this path
    app.get('/hello', function (req, res) {
        res.send('hello world!');
    });
    app.use('/sub-app', sub_app_1.factory({ logger }));
    app.use(function (req, res) {
        logger.error(`! 404 on "${req.path}" !"`);
        res.status(404).send(`Sorry, "${req.path}" is missing !`);
    });
    app.use(function (err, req, res, next) {
        logger.error(err.stack);
        res.status(500).send('Something broke !');
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=express-app.js.map