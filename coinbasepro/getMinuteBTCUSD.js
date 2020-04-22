// Coinbae Pro Websocket
const WebSocket = require('ws');
const ws = new WebSocket('wss://ws-feed.pro.coinbase.com');
const symbol = "BTC-USD";

// Google cloud Pub/Sub
const topicName = 'crypto-1m-data';
const projectId = 'project-id'
const keyFilename = '../creds.json'
const {PubSub} = require('@google-cloud/pubsub');
const pubSubClient = new PubSub({projectId, keyFilename});

async function publishMessage(data) {
  const dataBuffer = Buffer.from(data);

  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
}

/* When the connection opens, send a subscription message. */
ws.on('open', function open() {
  ws.send('{"type": "subscribe","product_ids": ["' + symbol + '"],"channels": ["matches"]}');
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
    publishMessage(data).catch(console.error);
  }
  else {
    console.log('Something else');
  }
});

/* Start server */
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});
