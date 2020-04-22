const topicName = 'crypto-1m-data';
const data = JSON.stringify({foo: 'bar'});

const {PubSub} = require('@google-cloud/pubsub');
// Creates a client; cache this for further use
const pubSubClient = new PubSub();

async function publishMessage() {
  /**
   * TODO(developer): Uncomment the following lines to run the sample.
   */
  // const topicName = 'my-topic';

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);

  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
}

publishMessage().catch(console.error);