const http = require('http');
const app = require('./app');

const port = process.env.port || 8888;
const server = http.createServer(app);
server.listen(port);