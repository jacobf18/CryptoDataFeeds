// Node
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // Google cloud Pub/Sub
  const topicName = 'tick-data-50';
  const projectId = 'crypto-intraday';
  const keyFilename = '../creds.json';
  const {PubSub} = require('@google-cloud/pubsub');
  const pubSubClient = new PubSub({projectId, keyFilename});

  async function publishMessage(data) {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  }

  const worker = new Worker(__filename);
  let queue = [];
  let size = 5;

  // This works synchronously so will not run again before the previous is done.
  worker.on('message', (message) => {
    queue.push(message);
    if (queue.length >= size) {
      // Create TOHLCV data
      let prices = [];
      let volume = 0;
      let startTime = 0;
      let symbol = queue[0]['symbol'];
      let open = 0;
      let close = 0;
      for (let i = 0; i < size; i++) {
        let d = queue.shift();
        if (i == 0) {
          startTime = d['time'];
          open = d['price'];
        }
        else if (i == size - 1) {
          close = d['price'];
        }
        prices.push(d['price']);
        volume += d['volume'];
      }
      console.log(queue.length);
      let high = Math.max(...prices);
      let low = Math.min(...prices);
      let data = {'time': startTime, 'open': open, 'high': high, 'low': low, 'close': close, 'volume': volume, 'symbol': symbol};
      console.log(data);
      publishMessage(data);
    }
  });
}
else {
  // Coinbae Pro Websocket
  const WebSocket = require('ws');
  const ws = new WebSocket('wss://ws-feed.pro.coinbase.com');
  const symbol = "BTC-USD";

  /* When the connection opens, send a subscription message. */
  ws.on('open', function open() {
    ws.send('{"type": "subscribe","product_ids": ["' + symbol + '"],"channels": ["matches"]}');
  });

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
      let volume = Number(dataJSON['size']);
      let utcTime = Number(new Date(dataJSON['time']));
      let data = {'price': price, 'volume': volume, 'time': utcTime, 'symbol': symbol};
      parentPort.postMessage(data);
    }
  });
}