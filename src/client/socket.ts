import { AnyClientMsg } from './messages';
import { executeCmd } from './commands/execute';
import { cmd } from './commands';
import { appState } from './appState';
import { message, connected } from './reducers';
import { unpackMessage } from './messages/unpack';

let ws: WebSocket | undefined;

export const connect = (url: string) => {
  if (ws) {
    ws.close();
  }

  // In the one-service Zeabur deployment the real game WebSocket server is
  // internal (localhost:3001). A browser cannot connect to that address, so
  // route any internal game URL back through the same public host. The
  // in-process proxy in oneService.ts forwards this WebSocket to :3001.
  const isInternalGameUrl =
    url === 'localhost:3001' ||
    url === '127.0.0.1:3001' ||
    url === 'http://localhost:3001' ||
    url === 'http://127.0.0.1:3001' ||
    url === 'https://localhost:3001' ||
    url === 'https://127.0.0.1:3001';

  if (isInternalGameUrl && typeof window !== 'undefined') {
    url = window.location.host;
  } else {
    // The game-list API normally supplies a host without a protocol. Remove
    // one if an older server response supplied it.
    url = url.replace(/^wss?:\/\//, '').replace(/^https?:\/\//, '');
  }

  // Use the page's protocol in production so HTTPS pages use WSS and HTTP
  // local development continues to use WS.
  const protocol =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? 'wss:'
      : 'ws:';

  url = `${protocol}//${url}`;

  ws = new WebSocket(url);
  ws.binaryType = 'arraybuffer';

  ws.addEventListener('open', () => {
    console.log('Connected');
    appState.connected = true;
    const cmd = connected(appState);
    executeCmd(cmd);
  });

  ws.addEventListener('close', () => {
    console.log('Disconnected');
    appState.connected = false;
    executeCmd(cmd.renderUI());
  });

  ws.addEventListener('error', (event) => {
    console.error('Game WebSocket error:', event);
  });

  ws.addEventListener('message', (ev) => {
    const msg = unpackMessage(ev.data);
    if (!msg) {
      return;
    }

    const cmd = message(appState, msg);
    executeCmd(cmd);
  });
};

export const sendMessage = (msg: AnyClientMsg) => {
  if (ws) {
    ws.send(JSON.stringify(msg));
  }
};

export const sendPbfMessage = (msg: ArrayBuffer) => {
  if (ws) {
    ws.send(msg);
  }
};
