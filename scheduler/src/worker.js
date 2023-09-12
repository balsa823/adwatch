// worker.js
const { SET_TIMESTAMP, NOT_SCHEDULED, SCHEDULED, kp_queue_topic, ho_queue_topic } = require('./consts');

const {Kafka} = require('kafkajs')

const kafkaClient = new Kafka({
  "clientId": `${process.env.KAFKA_CLIENT_ID}:${process.pid}`,
  "brokers": [process.env.KAFKA_BROKER]
})


const Redis = require('ioredis')
const db = require('../models');

const {timestamp, interval_to_seconds, get_shard_number, sleep} = require('./util')

const shard_numbers = process.argv[2].split(" ");
const num_partitions = process.env.PARTITION_COUNT

// const redisDemo = async () => {
//   // Connect to Redis at 127.0.0.1, port 6379.
  

//   // Set key "myname" to have value "Simon Prickett".
  

//   // Get the value held at key "myname" and log it.
//   const value = await redisClient.get('myname');
//   console.log(value);

//   // Disconnect from Redis.
//   redisClient.quit();
// };

const SITE_TO_QUEUE = {
  "kupujemprodajem.com": kp_queue_topic,
  "halooglasi.com": ho_queue_topic
}

const redis_cient = new Redis({
  host: 'redis',
  port: 6379,
})



const producer = kafkaClient.producer()

const schedule = async (execution, execution_key) => {
  const site =  execution.job.data.site
  const queue = SITE_TO_QUEUE[site]

  await producer.send({
    "topic": queue,
    "messages": [{
      "key": execution_key,
      "value": execution.job.data.keyword,
      "partition": 0
    }]
  })  
}


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

    // EXECUTION_KEY = user_id : job_id : execution_id
    const execution_key = `${execution.job.user_id}:${execution.job_id}:${execution.execution_id}`

    // check if already scheduled
    const scheduled = await redis_cient.get(execution_key)
    if(!scheduled) await schedule(execution, execution_key)


    await redis_cient.set(execution_key, timestamp())
    await redis_cient.expire(execution_key, 180)         // 3 mins

    // create next execution
    if( execution.retry_count < execution.job.retry_times ) {
      await db.Execution.create({
        execution_id: timestamp() + interval_to_seconds(execution.job.interval),
        job_id: execution.job_id,
        retry_count: execution.retry_count + 1,
        shard: get_shard_number(num_partitions),
        status: NOT_SCHEDULED
      })
    }
    
    await execution.update({
      worker_id: process.pid,
      status: SCHEDULED
    })

  }
};

process.on('message', async message => {
  switch(message.action){
    case SET_TIMESTAMP:
      await execute(message.data)
    break
    default:
      console.log(message)
  }
});


 (async()=>{
  try {
    await producer.connect()
    while(true) await sleep(500)
  } catch (error) {
    await redis_cient.quit();
    await producer.disconnect()
    process.exit(0);
  }
 
 })();
