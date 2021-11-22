const Server = require('./src/server.js');
const server = new Server();
console.log(`IPC Server running on port ${process.env.PORT}...`);