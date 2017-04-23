"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uuid = require("uuid");
const session = require("express-session");
const body_parser_1 = require("body-parser");
const bunyan_1 = require("bunyan");
const morgan = require("morgan");
const sub_app_1 = require("./routes/sub-app");
const defaultDependencies = {
    logger: console,
    sessionSecret: 'keyboard cat',
    isHttps: false,
};
function factory(dependencies = {}) {
    const { logger, sessionSecret, isHttps } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from express app!');
    if (!isHttps)
        logger.warn('XXX please activate HTTPS on this server !');
    if (sessionSecret === defaultDependencies.sessionSecret)
        logger.warn('XXX please set a secret for the session middleware !');
    var log = bunyan_1.createLogger({ name: "myapp" });
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
    // https://expressjs.com/en/starter/static-files.html
    // REM: respond with index.html when a GET request is made to the homepage
    app.use(express.static('public'));
    app.use(body_parser_1.urlencoded({
        parameterLimit: 100,
        limit: '1Mb',
    }));
    // respond with "hello world" when a GET request is made to this path
    app.get('/hello', function (req, res) {
        res.send('hello world!');
    });
    const defaultHCardProps = {
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
    const allowedKeys = Object.keys(defaultHCardProps);
    function validateKeys(hCardFieldsToUpdate) {
        const fieldsToUpdate = Object.keys(hCardFieldsToUpdate);
        for (let key of fieldsToUpdate) {
            if (!allowedKeys.includes(key)) {
                logger.error(`unrecognized key "${key}"`);
                return false;
            }
        }
        return true;
    }
    function updateKeys(hCardFieldsToUpdate, dbHCard) {
        const fieldsToUpdate = Object.keys(hCardFieldsToUpdate);
        console.log('data so far', dbHCard);
        console.log('data to update', hCardFieldsToUpdate);
        for (let key of fieldsToUpdate) {
            if (dbHCard[key] === hCardFieldsToUpdate[key])
                continue;
            // TODO call DB
            dbHCard[key] = hCardFieldsToUpdate[key];
        }
        console.log('data now', dbHCard);
    }
    app.post('/update', (req, res) => {
        const session = req.session;
        if (!session.hCard)
            session.hCard = {};
        logger.log('session IN', session);
        let status = 200;
        if (!validateKeys(req.body))
            status = 422;
        else
            updateKeys(req.body, session.hCard);
        logger.log('session OUT', session);
        res.status(status).end();
    });
    app.post('/submit', (req, res) => {
        logger.log(req.body);
        res.send('ok');
    });
    app.use('/sub-app', sub_app_1.factory({ logger }));
    app.use((req, res) => {
        logger.error(`! 404 on "${req.path}" !"`);
        res.status(404).send(`Sorry, "${req.path}" is missing !`);
    });
    app.use((err, req, res, next) => {
        logger.error(err.stack);
        res.status(500).send('Something broke !');
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=express-app.js.map