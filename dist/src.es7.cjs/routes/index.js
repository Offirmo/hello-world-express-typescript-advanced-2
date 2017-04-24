"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const splash_1 = require("../apps/splash");
const hcardLiveEdition_1 = require("../apis/hcardLiveEdition");
const hcardEdition_1 = require("../apps/hcardEdition");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
async function factory(dependencies = {}) {
    const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Hello from main route!');
    const router = express.Router();
    router.use('/', await splash_1.factory({
        logger,
    }));
    router.use('/', await hcardLiveEdition_1.factory({
        logger,
        userCRUD,
    }));
    router.use('/domain', await hcardEdition_1.factory({
        logger,
        userCRUD,
    }));
    return router;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map