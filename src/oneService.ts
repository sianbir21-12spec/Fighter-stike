import * as ws from 'ws';

// One public Zeabur service. The public HTTP/WebSocket endpoint is fixed to
// the port exposed by the Dockerfile/Zeabur service. The game server remains
// internal on port 3001.
process.env.ONE_SERVICE = 'true';
process.env.MAIN_SERVER_PORT = process.env.MAIN_SERVER_PORT || '3000';
process.env.GAME_SERVER_PORT = process.env.GAME_SERVER_PORT || '3001';

// Start the existing servers without changing their game logic.
// tslint:disable-next-line:no-var-requires
const main = require('./mainServer');
// tslint:disable-next-line:no-var-requires
require('./gameServer');

const publicServer: import('http').Server = main.server;
const proxyServer = new ws.Server({ noServer: true });

// The browser connects to the single public Zeabur domain. This in-process
// WebSocket proxy forwards that connection to the existing game server on :3001.
publicServer.on('upgrade', (request, socket, head) => {
  proxyServer.handleUpgrade(request, socket, head, (clientSocket) => {
    const gameSocket = new ws(`ws://127.0.0.1:${process.env.GAME_SERVER_PORT || '3001'}`);

    const closeBoth = () => {
      if (clientSocket.readyState === ws.OPEN || clientSocket.readyState === ws.CONNECTING) {
        clientSocket.close();
      }
      if (gameSocket.readyState === ws.OPEN || gameSocket.readyState === ws.CONNECTING) {
        gameSocket.close();
      }
    };

    gameSocket.on('open', () => {
      clientSocket.on('message', (data: ws.Data) => {
        if (gameSocket.readyState === ws.OPEN) {
          gameSocket.send(data);
        }
      });

      gameSocket.on('message', (data: ws.Data) => {
        if (clientSocket.readyState === ws.OPEN) {
          clientSocket.send(data);
        }
      });

      clientSocket.on('close', closeBoth);
      clientSocket.on('error', closeBoth);
      gameSocket.on('close', closeBoth);
      gameSocket.on('error', closeBoth);
    });

    gameSocket.on('error', (error) => {
      console.error('Game WebSocket proxy error:', error);
      closeBoth();
    });
  });
});

console.log(
  `One-service mode enabled: public=${process.env.MAIN_SERVER_PORT}, game=${process.env.GAME_SERVER_PORT}`,
);
