import WebSocket from 'isomorphic-ws';
import { EventEmitter } from 'events';

export default class IPCClient extends EventEmitter {
  id: number;
  scopes?: Array<String>;
  #socket: WebSocket;
  ready: Promise<any>;

  constructor(scopes = []) {
    super();
    this.scopes = scopes;
    this.#socket = new WebSocket(`ws://localhost:${7001}/${scopes.join('/')}`);
    this.ready = new Promise(r => (this.#socket.onopen = r));
    this.#socket.onmessage = e => this.handle(e);
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

  handle(e) {
    const data = JSON.parse(e.data);
    const scope = data.scope;
    this.emit(scope, data.data);
  }

  close() {
    this.#socket.close();
  }
}
