"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uuid = require("uuid");
const session = require("express-session");
const redisSession = require("connect-redis");
const body_parser_1 = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const user_1 = require("./persistence/user");
const routes_1 = require("./routes");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
    sessionSecret: 'keyboard cat',
    isHttps: false,
};
async function factory(dependencies = {}) {
    const { logger, sessionSecret, isHttps, dbUsers, dbSessionRedisUrl } = Object.assign({}, defaultDependencies, dependencies);
    logger.info('Initializing the top express app…');
    const RedisSessionStore = redisSession(session);
    if (!dbUsers)
        throw new Error('App: Need persistence db for users !');
    if (!dbSessionRedisUrl)
        logger.warn('XXX please provide a redis url for the session store !');
    // TODO HTTPS
    if (!isHttps)
        logger.warn('XXX please activate HTTPS on this server !');
    if (sessionSecret === defaultDependencies.sessionSecret)
        logger.warn('XXX please set a secret for the session middleware !');
    const app = express();
    // https://expressjs.com/en/4x/api.html#app.settings.table
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.use(function assignId(req, res, next) {
        req.uuid = uuid.v4();
        next();
    });
    // log the request as early as possible
    //app.use(morgan('combined')) // TODO remove
    app.use((req, res, next) => {
        logger.info({
            uuid: req.uuid,
            method: morgan['method'](req),
            url: morgan['url'](req),
        });
        next();
    });
    // TODO log on exit also !
    // TODO activate CORS
    app.use(helmet());
    // https://github.com/expressjs/session
    app.use(session({
        store: dbSessionRedisUrl
            ? new RedisSessionStore({ url: dbSessionRedisUrl })
            : undefined,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: isHttps,
        }
    }));
    // link the session to a user ID
    app.use(async (req, res, next) => {
        if (!req.session.userId) {
            // NOTE
            // This is an exercise
            // We are supposing the user is previously connected
            // Thus we are always using the same user:
            req.session.userId = '1234';
        }
        req.userId = req.session.userId;
        logger.info({
            uuid: req.uuid,
            sessionId: req.session.id,
            userId: req.userId,
        });
        next();
    });
    app.use(body_parser_1.urlencoded({
        extended: false,
        parameterLimit: 100,
        limit: '1Mb',
    }));
    app.use(await routes_1.factory({
        logger,
        userCRUD: await user_1.factory({ logger, db: dbUsers })
    }));
    app.use((req, res) => {
        logger.error(`! 404 on "${req.path}" !"`);
        res.status(404).end();
    });
    const errorHandler = (err, req, res, next) => {
        logger.error(err.stack);
        res.status(500).send('Something broke !');
    };
    app.use(errorHandler);
    return app;
}
exports.factory = factory;
//# sourceMappingURL=express-app.js.map