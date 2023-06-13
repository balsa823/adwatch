const {Kafka} = require('kafkajs')

const {kafka_topic} = require('./consts')

const messages = [
  {
    "value": "Macbook 2021",
    "partition": 1
  }
]

const run = async () => {
  
  try {

    const kafka = new Kafka({
      "clientId": process.env.KAFKA_CLIENT_ID,
      "brokers": [process.env.KAFKA_BROKER] 
    })

    const producer = kafka.producer()
    console.log("Connecting")
    
    await producer.connect()
    console.log("Connected")

    const result = await producer.send({
      "topic": kafka_topic,
      "messages": messages
    })

    console.log(`Send ${JSON.stringify(result)}`)
    await producer.disconnect();
    
  } 
  catch (ex) {
    console.error(`Something bad happened ${ex}`)
  }
  finally{
    process.exit(0)
  }

}

module.exports = {
  run
}