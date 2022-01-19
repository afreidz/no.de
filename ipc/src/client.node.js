const WebSocket = require('ws');
const { EventEmitter } = require('events');
const config = require('../../no.de.config.json');
const port = config.ipc.port;

class IPCClient extends EventEmitter {
  #socket;

  constructor(scopes = []) {
    super();
    this.scopes = scopes;
    this.#socket = new WebSocket(`ws://localhost:${port}/${scopes.join('/')}`);
    this.ready = new Promise(r => (this.#socket.on('open', () => r(true))));
    this.#socket.on('message', e => this.handle(e));
  }

  async send(scope, data) {
    await this.ready;
    this.#socket.send(JSON.stringify({ scope, data }));
  }

  handle(e) {
    const data = JSON.parse(e);
    const scope = data.scope;
    this.emit(scope, data.data);
  }

  close() {
    this.#socket.close();
  }
}

module.exports = IPCClient
