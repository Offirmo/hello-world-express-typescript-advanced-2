"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const bunyan_1 = require("bunyan");
const express_app_1 = require("./express-app");
console.log('Starting_');
const PORT = process.env.PORT || 5000;
const logger = bunyan_1.createLogger({ name: 'myapp' });
logger.info('Hello world from a node.js server!');
process.on('uncaughtException', err => {
    console.error(`Uncaught exception!`, err);
    setTimeout(() => process.exit(1), 250);
    logger.error(err, `Uncaught exception!`);
    // TODO cleanup
    // I've an experimental module for that…
});
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    setTimeout(() => process.exit(1), 250);
    logger.error({ reason, p }, `Uncaught exceptionUncaught exception!`);
    // TODO cleanup
    // I've an experimental module for that…
});
process.on('warning', warning => {
    console.warn(warning);
    logger.warn(warning);
});
const server = http_1.createServer(express_app_1.factory({
    logger: console,
    dbConnexionSettings: 'TODO take from env',
}));
server.listen(PORT, (err) => {
    if (err) {
        console.error(`Server error!`, err);
        logger.error(err, `Server error!`);
        return;
    }
    logger.info(`server is listening on ${PORT}`);
});
//# sourceMappingURL=index.js.map