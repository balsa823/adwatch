const { Kafka } = require('kafkajs')
const { mails_consumer_group , mails_kafka_topic } = require('./consts')
const db = require('../models')
const nodemailer = require('nodemailer')
const server_mail = 'adwatch.alert@gmail.com'
 
let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adwatch.alert@gmail.com',
        pass: 'tqogzvskgdfbmqmi'
    }
})


 

async function subscribeToKafkaTopic() {

  // const users = await db.User.findAll({
  //   include: [
  //     {
  //       model: db.Job,
  //       as: 'jobs',
  //       include: {
  //         model: db.Execution,
  //         as: "executions"
  //       }
  //     },
  //   ],
  // });
  
  // console.log(`USERS ${JSON.stringify(users)}`)



  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER],
  })

  const consumer = kafka.consumer({ "groupId": mails_consumer_group })

  await consumer.connect();
  console.log('Connected to Kafka. Subscribing to topic:', mails_kafka_topic)

  await consumer.subscribe({ topics: [mails_kafka_topic], fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ mails_kafka_topic, partition, message }) => {
      const { key, value } = message
      const [user_id, job_id, execution_id] = key.toString().split(":")

      const data = JSON.parse(value)

      // console.log(`\n\nUSER_ID ${user_id}, job_id: ${job_id}, execution_id: ${execution_id} \n`)
      // console.log(`\n\nUSER_ID ${typeof(user_id)}, job_id: ${typeof(job_id)}, execution_id: ${typeof(execution_id)} \n`)

      console.log(`Received message - Topic: ${mails_kafka_topic}, Partition: ${partition}, Key: ${key}, Value: ${data.toString()}`)

      const job = await db.Job.findOne({
        where: {
          id: job_id
        }
      })

      const user = await db.User.findOne({
        where: {
          id: user_id
        }
      })

      const mailDetails = {
        from: server_mail,
        to: user.email,
        subject: job.data.keyword,
        text: value
      }
     
      mailTransporter.sendMail(mailDetails, (err, data) => {
          if(err) {
              console.log(`Error Occurs ${err}`);
          } else {
              console.log('Email sent successfully');
          }
      })

    },
  })
}






subscribeToKafkaTopic();