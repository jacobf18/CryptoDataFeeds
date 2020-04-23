// Coinbae Pro Websocket
const WebSocket = require('ws');
const ws = new WebSocket('wss://ws-feed.pro.coinbase.com');
const symbol = "BTC-USD";

// Google cloud Pub/Sub
const topicName = 'tick-data-50';
const projectId = 'crypto-intraday'
const keyFilename = '../creds.json'
const {PubSub} = require('@google-cloud/pubsub');
const pubSubClient = new PubSub({projectId, keyFilename});

async function publishMessage(array, rawTime, volume) {
  let open = array[0];
  let high = Math.max.apply(Math, array);
  let low = Math.min.apply(Math, array);
  let close = array[array.length - 1];
  let utcTime = Number(new Date(rawTime));
  let data = {'time': utcTime, 'open': open, 'high': high, 'low': low, 'close': close, 'volume': volume};
  //console.log(data);
  const dataBuffer = Buffer.from(JSON.stringify(data));
  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
}

/* When the connection opens, send a subscription message. */
ws.on('open', function open() {
  ws.send('{"type": "subscribe","product_ids": ["' + symbol + '"],"channels": ["matches"]}');
});

let count = 0; /* Variable just for counting the heartbeats. */
let volume = 0;
let array = [];
let rawTime = '';
/* Parse a message as it is received */
ws.on('message', function incoming(data) {
  /* If heartbeat, do nothing, but count */
  let dataJSON = JSON.parse(data);
  let type = dataJSON['type'];

  if (type == 'heartbeat') {
    console.log('Heartbeat');
  }
  else if (type == 'match') {
    let price = Number(dataJSON['price']);
    console.log(price);
    array[count] = price;
    volume += Number(dataJSON['size']);
    if (count == 0) {
      rawTime = dataJSON['time'];
      count++;
    }
    else if (count == 5) {
      publishMessage(array, rawTime, volume).catch(console.error);
      count = 0;
      array = [];
    }
    else {
      count++;
    }
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
