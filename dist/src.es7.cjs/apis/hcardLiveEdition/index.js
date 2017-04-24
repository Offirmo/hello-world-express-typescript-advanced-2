"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
async function factory(dependencies = {}) {
    const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Initializing the client1 API…');
    if (!userCRUD)
        throw new Error('hCard live edition API: can’t work without a persistence layer!');
    const router = express_1.Router();
    router.post('/update', (req, res, next) => {
        userCRUD.update(req.userId, { pendingHCardUpdates: req.body })
            .then(() => void res.end())
            .catch(next);
    });
    router.post('/submit', (req, res, next) => {
        userCRUD.update(req.userId, { pendingHCardUpdates: req.body })
            .then(() => void res.end())
            .catch(next);
    });
    return router;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map