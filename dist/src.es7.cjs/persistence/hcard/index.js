"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const hcard_1 = require("../../models/hcard");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
async function factory(dependencies = {}) {
    const { logger, db } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Hello from hcard persistence!');
    if (!db)
        throw new Error('hCard persistence need a db connexion');
    const MEMORY_STORE = {};
    const ALLOWED_HCARD_KEYS = Object.keys(hcard_1.defaultHCard);
    function validateIdOrThrow(userId) {
        if (userId)
            return;
        const err = new Error('hCard CRUD: missing user Id!');
        err.httpStatusHint = 500;
        throw err;
    }
    function validateKeysOrThrow(hCardFieldsToUpdate) {
        const fieldsToUpdate = Object.keys(hCardFieldsToUpdate);
        for (let key of fieldsToUpdate) {
            if (!ALLOWED_HCARD_KEYS.includes(key)) {
                const err = new Error(`hCard: unrecognized key "${key}"`);
                err.httpStatusHint = 422;
                throw err;
            }
        }
    }
    async function create(userId, candidateData = {}) {
        const err = new Error('hCard CRUD: not implemented!');
        err.httpStatusHint = 501;
        throw err;
    }
    async function read(userId) {
        validateIdOrThrow(userId);
        let res = MEMORY_STORE[userId];
        if (!res) {
            // XXX
            // for the sake of the exercise, let's pretend we have existing data
            res = {
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
        }
        if (res)
            res = Object.assign({}, res);
        return res;
    }
    async function update(userId, candidateData) {
        validateIdOrThrow(userId);
        validateKeysOrThrow(candidateData);
        let needUpdate = false;
        let existingData = await read(userId);
        if (!existingData) {
            existingData = {};
            needUpdate = true;
        }
        const fieldsToUpdate = Object.keys(candidateData);
        const newData = existingData;
        console.log('data so far', existingData);
        console.log('data to update', candidateData);
        for (let key of fieldsToUpdate) {
            if (existingData[key] === candidateData[key])
                continue;
            needUpdate = true;
            newData[key] = candidateData[key];
        }
        if (needUpdate)
            MEMORY_STORE[userId] = newData;
        console.log('data now', MEMORY_STORE[userId]);
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