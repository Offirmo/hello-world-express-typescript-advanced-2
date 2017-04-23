"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const hcard_1 = require("../../models/hcard");
const defaultDependencies = {
    logger: console,
};
function factory(dependencies = {}) {
    const { logger } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from an API!');
    const router = express.Router();
    const ALLOWED_HCARD_KEYS = Object.keys(hcard_1.defaultHCard);
    function validateKeys(hCardFieldsToUpdate) {
        const fieldsToUpdate = Object.keys(hCardFieldsToUpdate);
        for (let key of fieldsToUpdate) {
            if (!ALLOWED_HCARD_KEYS.includes(key)) {
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
    router.post('/update', (req, res) => {
        let status = 200;
        status = 500;
        /*const session: SessionData = req.session as SessionData
        if (!session.hCard) session.hCard = {}
        logger.log('session IN', session)

        if (!validateKeys(req.body))
            status = 422
        else
            updateKeys(req.body, session.hCard)

        logger.log('session OUT', session)*/
        res.status(status).end();
    });
    router.post('/submit', (req, res) => {
        logger.log(req.body);
        res.send('ok');
    });
    return router;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map