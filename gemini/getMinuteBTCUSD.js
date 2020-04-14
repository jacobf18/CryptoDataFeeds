const WebSocket = require('ws');

const ws = new WebSocket('wss://api.gemini.com/v2/marketdata');
const subscription = "candles_1m";
const symbol = "BTCUSD";

/* When the connection opens, send a subscription message. */
ws.on('open', function open() {
  ws.send('{"type":"subscribe","subscriptions":[{"name":"' + subscription + '","symbols":["' + symbol + '"]}]}');
});

let count = 0; /* Variable just for counting the heartbeats. */
/* Parse a message as it is received */
ws.on('message', function incoming(data) {
  /* If heartbeat, do nothing, but count */
  let dataJSON = JSON.parse(data);
  let type = dataJSON['type'];
  
  if (type == 'heartbeat') {
    console.log('Heartbeat ' + count);
    count++;
  }
  else if (type == 'candles_1m_updates') {
    console.log(dataJSON['changes']);
    count = 0;
  }
  else {
    console.log('Something else');
  }
});