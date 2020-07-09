"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const lodash_1 = require("lodash");
const user_1 = require("../../models/user");
const hcard_1 = require("../../models/hcard");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
async function factory(dependencies = {}) {
    const { logger, db } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Hello from user persistence!');
    if (!db)
        throw new Error('User persistence need a db connexion');
    const userCollection = db.collection('users');
    function validateUserIdOrThrow(userId) {
        if (userId)
            return;
        const err = new Error('user CRUD: missing user Id!');
        err.httpStatusHint = 500;
        throw err;
    }
    async function create(candidateData = {}) {
        hcard_1.validateKeysOrThrow(candidateData.hCard || {});
        const data = lodash_1.defaultsDeep({}, candidateData, user_1.defaultUser);
        const { insertedId } = await userCollection.insertOne(data);
        return insertedId.toHexString();
    }
    async function read(userId) {
        var _a;
        validateUserIdOrThrow(userId);
        return (_a = (await userCollection.findOne({ id: userId }))) !== null && _a !== void 0 ? _a : undefined;
    }
    async function update(userId, candidateData) {
        validateUserIdOrThrow(userId);
        hcard_1.validateKeysOrThrow(candidateData.hCard || {});
        let existingData = await read(userId);
        if (!existingData) {
            const err = new Error(`User not found`);
            err.httpStatusHint = 404;
            err.details = { userId };
            throw err;
        }
        await userCollection.updateOne({ id: userId }, lodash_1.defaultsDeep({}, candidateData, existingData));
    }
    async function purge(userId) {
        validateUserIdOrThrow(userId);
        throw new Error('Not implemented!');
    }
    // XXX for the sake of the exercise,
    // auto-create user 1234 if it doesn't exist
    if (!(await read('1234'))) {
        logger.info('Recreating the demo user...');
        create({
            id: '1234',
            hCard: {
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
            }
        });
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