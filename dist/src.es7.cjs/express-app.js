"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uuid = require("uuid");
const session = require("express-session");
const body_parser_1 = require("body-parser");
const bunyan_1 = require("bunyan");
const morgan = require("morgan");
const routes_1 = require("./routes");
const defaultDependencies = {
    logger: console,
    sessionSecret: 'keyboard cat',
    isHttps: false,
};
function factory(dependencies = {}) {
    const { logger, sessionSecret, isHttps } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from express app!'); // TODO remove
    // TODO HTTPS
    if (!isHttps)
        logger.warn('XXX please activate HTTPS on this server !');
    if (sessionSecret === defaultDependencies.sessionSecret)
        logger.warn('XXX please set a secret for the session middleware !');
    // TODO make that better
    const log = bunyan_1.createLogger({ name: "myapp" });
    log.info("hi");
    const app = express();
    // https://expressjs.com/en/4x/api.html#app.settings.table
    app.enable('trust proxy');
    app.disable('x-powered-by'); // safety
    app.use(function assignId(req, res, next) {
        req.uuid = uuid.v4();
        next();
    });
    // https://github.com/expressjs/session
    // TODO store sessions in Redis
    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: isHttps,
        }
    }));
    // log the request
    app.use(morgan('combined')); // TODO remove
    app.use((req, res, next) => {
        log.info({
            uuid: req.uuid,
            method: morgan['method'](req),
            url: morgan['url'](req),
        });
        log.info({
            uuid: req.uuid,
            sessionId: req.session.id,
        });
        next();
    });
    app.use(body_parser_1.urlencoded({
        parameterLimit: 100,
        limit: '1Mb',
    }));
    app.use(routes_1.factory({ logger }));
    app.use((req, res) => {
        logger.error(`! 404 on "${req.path}" !"`);
        res.status(404).end();
    });
    app.use((err, req, res, next) => {
        logger.error(err.stack);
        res.status(500).send('Something broke !');
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=express-app.js.map