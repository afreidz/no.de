const uuid = require('uuid');
const { sep } = require('path');
const { WebSocketServer } = require('ws');

module.exports = class IPCServer {
  #server;

  constructor(opts = { port: process.env.PORT || 8081 }) {
    const { port } = opts;
    this.clients = new Map();
    this.#server = new WebSocketServer({ port });

    this.#server.on('connection', (ws, req) => {
      const id = uuid.v4();
      const scopes = req.url?.split(sep).filter(Boolean);

      this.clients.set(id, { socket: ws, scopes });

      ws.on('message', m => this.handle(m));
      ws.send(JSON.stringify({ scope: 'ipc', data: { msg: 'connected', id, scopes } }));
    });
  }

  handle(m) {
    const data = JSON.parse(m);
    const clients = [...this.clients.values()]
      .filter(c => c.scopes.includes(data.scope));

    clients.forEach(c => {
      c.socket.send(JSON.stringify(data));
    });
  }
}

