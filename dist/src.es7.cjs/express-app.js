"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uuid = require("uuid");
const session = require("express-session");
const body_parser_1 = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const session_1 = require("./persistence/session");
const hcard_1 = require("./persistence/hcard");
const routes_1 = require("./routes");
const defaultDependencies = {
    logger: console,
    sessionSecret: 'keyboard cat',
    isHttps: false,
};
function factory(dependencies = {}) {
    const { logger, sessionSecret, isHttps, dbConnexionSettings } = Object.assign({}, defaultDependencies, dependencies);
    logger.info('Hello from express app!'); // TODO remove
    if (!dbConnexionSettings)
        throw new Error('App: Need persistence settings!');
    // TODO HTTPS
    if (!isHttps)
        logger.warn('XXX please activate HTTPS on this server !');
    if (sessionSecret === defaultDependencies.sessionSecret)
        logger.warn('XXX please set a secret for the session middleware !');
    const sessionCRUD = session_1.factory({
        logger,
        dbConnexionSettings,
    });
    const app = express();
    // https://expressjs.com/en/4x/api.html#app.settings.table
    app.enable('trust proxy');
    app.disable('x-powered-by'); // safety
    app.use(function assignId(req, res, next) {
        req.uuid = uuid.v4();
        next();
    });
    // log the request as early as possible
    app.use(morgan('combined')); // TODO remove
    app.use((req, res, next) => {
        logger.info({
            uuid: req.uuid,
            method: morgan['method'](req),
            url: morgan['url'](req),
        });
        next();
    });
    // TODO activate CORS
    app.use(helmet());
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
    // Use the session to link to a user ID
    let crudeUserIdGenerator = 0;
    const sessionKey = Symbol('session to user');
    app.use(async (req, res, next) => {
        // TODO
        const sessionId = req.session.id;
        let session = await sessionCRUD.read(sessionId);
        if (!session) {
            session = {
                userId: `${++crudeUserIdGenerator}`
            };
            console.log('created userId', session.userId);
            await sessionCRUD.create(sessionId, session);
        }
        const { userId } = session;
        console.log({ userId });
        req.userId = userId;
        logger.info({
            uuid: req.uuid,
            sessionId,
            userId,
        });
        next();
    });
    app.use(body_parser_1.urlencoded({
        parameterLimit: 100,
        limit: '1Mb',
    }));
    app.use(routes_1.factory({
        logger,
        hCardCRUD: hcard_1.factory({ logger, dbConnexionSettings })
    }));
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