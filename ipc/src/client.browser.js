import EventEmitter from 'events';
import config from '../../no.de.config.json';

const port = config.ipc.port;
export default class IPCCLient extends EventEmitter {
  #socket;

  constructor(scopes = []) {
    super();
    this.scopes = scopes;
    this.#socket = new WebSocket(`ws://localhost:${port}/${scopes.join('/')}`);
    this.ready = new Promise(r => (this.#socket.onopen = () => r(true)));
    this.#socket.onmessage = e => this.handle(e);
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
