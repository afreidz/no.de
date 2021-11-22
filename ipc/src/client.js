const Socket = require('ws');
const { sep } = require('path');
const { EventEmitter } = require('events');

class IPCClient extends EventEmitter {
  #socket;

  constructor(scopes = []) {
    super();
    this.scopes = scopes;
    this.#socket = new Socket(`ws://localhost:8080${sep}${scopes.join(sep)}`);
    this.ready = new Promise(r => this.#socket.on('open', r));
    this.#socket.on('message', m => this.handle(m));
    this.on('ipc', data => {
      if (data.msg === 'connected') {
        this.id = data.id;
        this.scopes = data.scopes;
      }
    });
  }

  async send(scope, data) {
    await this.ready;
    this.#socket.send(JSON.stringify({ scope, data }));
  }

  handle(str) {
    const data = JSON.parse(str);
    const scope = data.scope;
    this.emit(scope, data.data);
  }

  close() {
    this.#socket.close();
  }
}

module.exports = IPCClient;