const {Kafka} = require('kafkajs')

const {kp_queue_topic, ho_queue_topic} = require('./consts')

const createTopic = async () => {
  
  try {

    const kafka = new Kafka({
      "clientId": process.env.KAFKA_CLIENT_ID,
      "brokers": [process.env.KAFKA_BROKER] 
    })

    const admin = kafka.admin()
    await admin.connect()

    const result = await admin.createTopics({
      "topics": [
        {
          "topic": kp_queue_topic,
          "numPartitions": 1
        },
        {
          "topic": ho_queue_topic,
          "numPartitions": 1
        }   
      ]
    })
    console.log(`Created ! ${result}`)

    const list = await admin.listTopics()

    console.log(`Topics ! ${list}`)

    await admin.disconnect();
  } 
  catch (ex) {
    console.error(`Something bad happened ${ex}`)
  }
  finally{
    process.exit(0)
  }

}

(async()=>{
  await createTopic()
})()