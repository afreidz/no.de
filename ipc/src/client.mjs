import EventEmitter from 'events';

export default class IPCClient extends EventEmitter {
  #socket;

  constructor(scopes = []) {
    super();
    this.scopes = scopes;
    this.#socket = new WebSocket(`ws://localhost:8080/${scopes.join('/')}`);
    this.ready = new Promise(r => this.#socket.addEventListener('open', r));
    this.#socket.addEventListener('message', m => this.handle(m));
    this.on('ipc', data => {
      if (data.msg === 'connected') this.id = data.id;
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
}