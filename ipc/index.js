const Server = require('./src/server.js');
new Server();
console.log(`IPC Server running on port ${process.env.PORT}...`);
