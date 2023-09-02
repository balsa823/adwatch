const { Kafka } = require('kafkajs');
const {posting_consumer_group , posting_kafka_topic, mails_kafka_topic} = require('./consts')
const db = require('../models');
const { run } = require('./scrapper')

const kafka = new Kafka({
  "clientId": `${process.env.KAFKA_CLIENT_ID}:${process.pid}`,
  "brokers": [process.env.KAFKA_BROKER]
})
const producer = kafka.producer()

const send_mails = async (key, result) => {
  if(result.length == 0) return

  messages = [{
    "key": key,
    "value": JSON.stringify(result),
    "partition": 0
  }]

  const connection_status = await producer.connect()
  console.log(`Connected to Kafka. Producing to topic: ${mails_kafka_topic}, Connection status: ${connection_status}`);

  const sending_status = await producer.send({
    "topic": mails_kafka_topic,
    "messages": messages
  })
  console.log(`Sending status ${sending_status} ! Scrapper sent messages ${JSON.stringify(messages)} `)

  await producer.disconnect();
}

async function subscribeToKafkaTopic() {

  const consumer = kafka.consumer({ "groupId": posting_consumer_group });

  await consumer.connect();
  console.log('Connected to Kafka. Consuming from topic: ', posting_kafka_topic);

  await consumer.subscribe({ topics: [posting_kafka_topic], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ posting_kafka_topic, partition, message }) => {
      const { key, value } = message
      const [user_id, job_id, execution_id] = key.toString().split(":")
      const keyword = value.toString()

      console.log(`Received message - Topic: ${posting_kafka_topic}, Partition: ${partition}, Key: ${key}, Value: ${keyword}`)

      let execution = await db.Execution.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            {
              job_id: job_id
            },
            {
              execution_id: execution_id
            }
          ]
        }
      })

      execution.status = "scrapping"
      await execution.save()

      const result = await run(keyword.toString())

      execution.execution_result = {result}

      await send_mails(key, result)

      execution.status = "sent"
      await execution.save()

    },
  });
}

subscribeToKafkaTopic();