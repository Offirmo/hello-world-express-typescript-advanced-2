"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("supertest");
const _1 = require(".");
describe('hCard edition app', function () {
    function makeUserCRUD() {
        async function create(candidateData = {}) {
            throw new Error('Not implemented!');
        }
        async function read(userId) {
            throw new Error('Not implemented!');
        }
        async function update(userId, candidateData) {
            throw new Error('Not implemented!');
        }
        async function purge(userId) {
            throw new Error('Not implemented!');
        }
        return {
            create,
            read,
            update,
            purge,
        };
    }
    describe('routes', function () {
        describe('/', function () {
            it('should serve an HTML page', (done) => {
                _1.factory({ userCRUD: makeUserCRUD() }).then(app => {
                    console.log(app);
                    request(app)
                        .get('/')
                        //.expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });
            it('should serve a form');
        });
        describe('/submit', function () {
            it('accepts an urlencoded body containing from data');
            it('should reject malformed data');
        });
    });
});
//# sourceMappingURL=index_spec.js.map