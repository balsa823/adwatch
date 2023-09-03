const { Kafka } = require('kafkajs');
const {kp_queue_consumer_group, kp_queue_topic, ho_queue_consumer_group, ho_queue_topic, mails_queue, SCRAPING, SCRAPED} = require('./consts')
const db = require('../models');
const { kp_run } = require('./kp_scrapper')


const QUEUE_TO_FUN = {
  kp_queue: (keyword) => kp_run(keyword),
  //ho_queue_topic: ho_run
}

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
  console.log(`Connected to Kafka. Producing to topic: ${mails_queue}, Connection status: ${connection_status}`);

  const sending_status = await producer.send({
    "topic": mails_queue,
    "messages": messages
  })
  console.log(`Sending status ${sending_status} ! Scrapper sent messages ${JSON.stringify(messages)} `)

  await producer.disconnect();
}

async function subscribeToKafkaTopic(topic, consumer_group) {

  const consumer = kafka.consumer({ "groupId": consumer_group });

  await consumer.connect();
  console.log(`Connected to Kafka. Consuming from topic:${topic}`);

  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`Subscribed to Kafka Consuming from topic:${topic}`);


  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { key, value } = message
      const [ user_id, job_id, execution_id ] = key.toString().split(":")
      const keyword = value.toString()

      console.log(`Received message - Topic: ${topic}, Partition: ${partition}, Key: ${key}, Value: ${keyword}`)

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
      if(!execution)return

      execution.status = SCRAPING
      await execution.save()

      const run = QUEUE_TO_FUN[topic]

      const result = await run(keyword.toString())

      execution.execution_result = {result}

      await send_mails(key, result)

      execution.status = SCRAPED
      await execution.save()

    },
  });
}

(async()=>{
  await subscribeToKafkaTopic(kp_queue_topic, "1");
  //await subscribeToKafkaTopic(ho_queue_topic.trim(), ho_queue_consumer_group);
})()
