const { Kafka } = require('kafkajs');
const {consumer_group , kafka_topic} = require('./consts')
const db = require('../models');
const { run } = require('./scrapper')

const topic = require('./topic');


async function subscribeToKafkaTopic(topic) {
  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER],
  });

  const consumer = kafka.consumer({ "groupId": consumer_group });

  await consumer.connect();
  console.log('Connected to Kafka. Subscribing to topic:', topic);

  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { key, value } = message
      const data = JSON.parse(value)

      console.log(`Received message - Topic: ${topic}, Partition: ${partition}, Key: ${key}, Value: ${data.toString()}`)

      let execution = await db.Execution.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            {
              job_id: data.job_id
            },
            {
              execution_id: data.execution_id
            }
          ]
        }
      })

      execution.status = "executing"
      await execution.save()

      const result = await run(data.keyword.toString())

      //Execution results append
      execution.execution_result = {result}
      execution.status = "executed"
      await execution.save()

    },
  });
}

subscribeToKafkaTopic(kafka_topic);