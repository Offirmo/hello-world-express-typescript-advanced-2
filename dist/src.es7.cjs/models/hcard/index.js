"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultHCard = {
    givenName: '',
    surname: '',
    email: '',
    phone: '',
    houseNumber: '',
    street: '',
    suburb: '',
    state: '',
    postcode: '',
    country: 'Australia'
};
exports.defaultHCard = defaultHCard;
const ALLOWED_KEYS = Object.keys(defaultHCard);
function validateKeysOrThrow(userFieldsToUpdate) {
    const fieldsToUpdate = Object.keys(userFieldsToUpdate);
    for (let key of fieldsToUpdate) {
        if (!ALLOWED_KEYS.includes(key)) {
            const err = new Error(`user: unrecognized key "${key}"`);
            err.httpStatusHint = 422;
            throw err;
        }
    }
}
exports.validateKeysOrThrow = validateKeysOrThrow;
//# sourceMappingURL=index.js.map