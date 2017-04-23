"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const defaultDependencies = {
    logger: console,
};
function factory(dependencies = {}) {
    const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from an API!');
    if (!hCardCRUD)
        throw new Error('hCard API: can’t work without a persistence layer!');
    const router = express_1.Router();
    router.post('/update', (req, res, next) => {
        hCardCRUD.update(req.userId, req.body)
            .then(() => void res.end())
            .catch(next);
    });
    router.post('/submit', (req, res, next) => {
        hCardCRUD.update(req.userId, req.body)
            .then(() => void res.end())
            .catch(next);
    });
    return router;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map