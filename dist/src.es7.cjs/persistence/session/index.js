"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultDependencies = {
    logger: console,
};
function factory(dependencies = {}) {
    const { logger, dbConnexionSettings } = Object.assign({}, defaultDependencies, dependencies);
    logger.log('Hello from session persistence!');
    if (!dbConnexionSettings)
        throw new Error('DB access need connexion settings!');
    const MEMORY_STORE = {};
    let crudeSessionIdGenerator = 0;
    function validateIdOrThrow(sessionId) {
        if (sessionId)
            return;
        const err = new Error('Session CRUD: missing session id!');
        err.httpStatusHint = 500;
        throw err;
    }
    async function create(sessionId, candidateData = {}) {
        if (sessionId) {
            if (MEMORY_STORE.hasOwnProperty(sessionId)) {
                const err = new Error('Session CRUD: id conflict!');
                err.httpStatusHint = 500;
                throw err;
            }
        }
        sessionId = sessionId || `${++crudeSessionIdGenerator}`;
        MEMORY_STORE[sessionId] = Object.assign({}, candidateData);
        return sessionId;
    }
    async function read(sessionId) {
        validateIdOrThrow(sessionId);
        return MEMORY_STORE[sessionId];
    }
    async function update(userId, candidateData) {
        validateIdOrThrow(userId);
        const err = new Error('Session CRUD: not implemented!');
        err.httpStatusHint = 501;
        throw err;
    }
    async function purge(userId) {
        validateIdOrThrow(userId);
        delete MEMORY_STORE[userId];
    }
    return {
        create,
        read,
        update,
        purge,
    };
}
exports.factory = factory;
//# sourceMappingURL=index.js.map