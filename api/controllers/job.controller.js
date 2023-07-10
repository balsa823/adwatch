const {interval_to_seconds, timestamp, get_shard_number, NOT_SCHEDULED} = require('../util')
const number_of_partitions = process.env.PARTITION_COUNT
const db = require('../models')

const schedule = async (req, res) => {
  try {    
    
    const job = {
      user_id:req.user_id,
      retry_times: req.body.retry_times,
      description: req.body.description,
      interval: req.body.interval,
    }

    console.log(`Adding ${job} job for user ${req.user_id}`)

    const inserted = await db.Job.create(job)

    const now = timestamp()

    console.log(`Timestamp ${now}`)

    const execution = {
      execution_id: now + interval_to_seconds(job.interval),
      job_id: inserted.id,
      shard: get_shard_number(number_of_partitions),
      status: NOT_SCHEDULED
    }

    console.log(`Execution ${JSON.stringify(execution)}`)

    await db.Execution.create(execution)

    res.send({
      job_id: inserted.id,
    }).status(200)

  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  schedule
}