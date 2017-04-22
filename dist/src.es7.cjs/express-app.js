"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const defaultDependencies = {
    logger: console,
};
function factory(dependencies = {}) {
    const { logger } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from express app!');
    const app = express();
    // https://expressjs.com/en/4x/api.html#app.settings.table
    app.enable('trust proxy');
    app.disable('x-powered-by');
    // https://expressjs.com/en/starter/static-files.html
    // REM: respond with index.html when a GET request is made to the homepage
    app.use(express.static('public'));
    // respond with "hello world" when a GET request is made to this path
    app.get('/hello', function (req, res) {
        res.send('hello world!');
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=express-app.js.map