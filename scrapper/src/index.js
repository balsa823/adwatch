const { Kafka } = require('kafkajs');
const {consumer_group , kafka_topic} = require('./consts')

const topic = require('./topic')

async function subscribeToKafkaTopic(topic) {
  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER],
  });

  const consumer = kafka.consumer({ groupId: consumer_group });

  await consumer.connect();
  console.log('Connected to Kafka. Subscribing to topic:', topic);

  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { key, value } = message;
      console.log(`Received message - Topic: ${topic}, Partition: ${partition}, Key: ${key}, Value: ${value.toString()}`);
    },
  });
}

subscribeToKafkaTopic(kafka_topic);
  

