// worker.js
const { SET_TIMESTAMP, NOT_SCHEDULED, SCHEDULED, kp_queue_topic, ho_queue_topic } = require('./consts');
const {Kafka} = require('kafkajs')
const db = require('../models');

const {timestamp, interval_to_seconds, get_shard_number, sleep} = require('./util')

const shard_numbers = process.argv[2].split(" ");
const num_partitions = process.env.PARTITION_COUNT

const SITE_TO_QUEUE = {
  "kupujemprodajem.com": kp_queue_topic,
  "halooglasi.com": ho_queue_topic
}

const kafka = new Kafka({
  "clientId": `${process.env.KAFKA_CLIENT_ID}:${process.pid}`,
  "brokers": [process.env.KAFKA_BROKER]
})

const producer = kafka.producer()

const send_messages = async (executions) => {
  if(executions.length == 0) return


  const topics_with_messages = executions.reduce((acc, execution) => {
    const site =  execution.job.data.site
    const queue = SITE_TO_QUEUE[site]
    const message = {
      "key": `${execution.job.user_id}:${execution.job_id}:${execution.execution_id}`,
      "value": execution.job.data.keyword,
      "partition": 0
    }

    if (!acc[queue]) { acc[queue] = [] }
  
    acc[queue].push(message)
  
    return acc
  }, {})
  
  console.log(topics_with_messages)
  
  const topics_array = Object.entries(topics_with_messages).map(([queue, messages]) => ({
    queue,
    messages,
  }))

  console.log(topics_array)
  console.log(typeof(topics_array))

  const connection = await producer.connect()
  console.log(`[WORKER] ${process.pid} connection => ${JSON.stringify(connection)}`)


  await Promise.all(topics_array.map(async ({queue, messages}) => {
    console.log(`[WORKER] ${process.pid} queue => ${JSON.stringify(queue)}`)
    console.log(`[WORKER] ${process.pid} messages => ${JSON.stringify(messages)}`)

    const result = await producer.send({
      "topic": queue,
      "messages": messages
    })
    console.log(`[WORKER] ${process.pid} result => ${JSON.stringify(result)}`)
  }))

  await producer.disconnect();
}


process.on('message', async message => {
  switch(message.action){
    case SET_TIMESTAMP:
      //console.log(`[WORKER] [${process.pid}] working on timestamp ${message.data}`)
      await execute(message.data)
    break
    default:
      console.log(message)
  }
});

const execute = async (time) => {
  const executions = await db.Execution.findAll({
    where: {
      [db.Sequelize.Op.and]: [
        {
          shard: {
            [db.Sequelize.Op.or]: shard_numbers
          }
        },
        {
          execution_id: {
            [db.Sequelize.Op.lte]: time
          }
        },
        {
          status: NOT_SCHEDULED
        }
      ]
    },
    include: [
      {
         model: db.Job, as: 'job',
      }
    ]
  })


  for (let i = 0; i < executions.length; i++)  {
    let execution = executions[i]

    execution.status = SCHEDULED
    execution.worker_id = process.pid


    if( execution.retry_count < execution.job.retry_times ) {
      const next_execution = {
        execution_id: timestamp() + interval_to_seconds(executions[i].job.interval),
        job_id: execution.job_id,
        retry_count: execution.retry_count + 1,
        shard: get_shard_number(num_partitions),
        status: NOT_SCHEDULED
      }
  
      //console.log(`Scheduling next execution ${JSON.stringify(next_execution)}`)
  
      await db.Execution.create(next_execution)
    }

    await execution.save()

  }

  await send_messages(executions)

};


 (async()=>{
  //console.log(`[WORKER] [${process.pid}] alive`)
  try {
    while(true) await sleep(1000);
  } catch (error) {
    process.exit(0);
  }
 
 })();
