const { Kafka } = require('kafkajs');
const {kp_queue_consumer_group, kp_queue_topic, ho_queue_consumer_group, ho_queue_topic, mails_queue, DONE, PROCESSING} = require('./consts')
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));
const db = require('../models');
const { kp_run } = require('./kp_scrapper')
const { ho_run } = require('./ho_scrapper')

const QUEUE_TO_FUN = {
  kp_queue: (keyword) => kp_run(keyword),
  ho_queue: (keyword) => ho_run(keyword)
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
      const input = value.toString()

      console.log(`Received message - Topic: ${topic}, Partition: ${partition}, Key: ${key}, Value: ${input}`)

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
      if(!execution) return

      await execution.update({ status: PROCESSING })

      const run = QUEUE_TO_FUN[topic]

      const result = await run(input.toString())

      await send_mails(key, result)
      
      await execution.update({
        execution_result: result,
        status: DONE
      })

    },
  });
}



(async()=>{
  try {
    await producer.connect()
    //await subscribeToKafkaTopic(kp_queue_topic, "1");
    await subscribeToKafkaTopic(ho_queue_topic, "2");
    while(true) await sleep(100)
  } catch (error) {
    await producer.disconnect()
    process.exit(0);
  }
 
 })();
