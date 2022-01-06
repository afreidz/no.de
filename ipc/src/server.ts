import { v4 } from 'uuid';
import { sep } from 'path';
import ws, { Server } from 'ws';

export default class IPCServer {
  clients: Map<v4, ws>;
  #server: Server;

  constructor(opts = { port: process.env.PORT || 8081 }) {
    const { port } = opts;
    this.clients = new Map();
    this.#server = new Server({ port });

    this.#server.on('connection', (ws, req) => {
      const id = v4();
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

