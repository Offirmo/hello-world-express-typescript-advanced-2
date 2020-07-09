"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const express = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const splash_1 = require("../apps/splash");
const hcardEdition_1 = require("../apps/hcardEdition");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
async function factory(dependencies = {}) {
    const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Hello from main route!');
    const router = express.Router();
    router.use('/s', await splash_1.factory({
        logger,
    }));
    router.use('/', await hcardEdition_1.factory({
        logger,
        userCRUD,
    }));
    return router;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map