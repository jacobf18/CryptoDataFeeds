const WebSocket = require('ws');

const ws = new WebSocket('wss://echo.websocket.org/', {
  origin: 'https://websocket.org'
});

const duplex = WebSocket.createWebSocketStream(ws, { encoding: 'utf8' });

duplex.pipe(process.stdout);
process.stdin.pipe(duplex);