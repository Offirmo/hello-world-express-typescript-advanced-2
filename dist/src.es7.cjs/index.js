"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const express_app_1 = require("./express-app");
console.log('Hello world from express server!');
const PORT = process.env.PORT || 5000;
const server = http_1.createServer(express_app_1.factory());
server.listen(PORT, (err) => {
    if (err)
        return console.error('something bad happened', err);
    console.info(`server is listening on ${PORT}`);
});
//# sourceMappingURL=index.js.map