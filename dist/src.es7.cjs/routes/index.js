"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const base_1 = require("../apps/base");
const client1_1 = require("../apis/client1");
const client1_2 = require("../apps/client1");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
function factory(dependencies = {}) {
    const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Hello from main route!');
    const router = express.Router();
    router.use('/', base_1.factory({
        logger,
    }));
    router.use('/', client1_1.factory({
        logger,
        hCardCRUD,
    }));
    router.use('/domain', client1_2.factory({
        logger,
        hCardCRUD,
    }));
    return router;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map