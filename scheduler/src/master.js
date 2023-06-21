const { fork } = require('child_process');
const db = require('../models');
const {SET_PARTITIONS, SET_TIMESTAMP} = require('./consts')


const min_num_workers = 2

let num_workers = process.env.SCHEDULER_REPLICATION_FACTOR
const num_partitions = process.env.PARTITION_COUNT
const workers = []
let partitions = []


const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const timestamp = (now = new Date()) => (Math.floor(now.getTime() / 1000))

const generatePartitions = () => {
  let worker_index = 0
  partitions = []
  for (let i = 0; i < num_partitions; i++) {
    if( ! partitions[worker_index]) partitions[worker_index] = [i]
    else partitions[worker_index].push(i)

    worker_index += 1
    if(worker_index == num_workers ) worker_index = 0
  }

}

const startWorker = (shard_numbers) => {
  const worker = fork('src/worker.js', [shard_numbers]);

  worker.on('exit', async () => {
    console.log(`[MASTER] Worker ${worker.pid} has died.`);
  
    const index = workers.indexOf(worker);
    if (index !== -1) workers.splice(index, 1)
   
    generatePartitions()
    await startWorkers()

  });

  workers.push(worker);

  console.log(`[MASTER] Started worker ${worker.pid}`);
};

const startWorkers = async () => {
  for(let count = 0; count < num_workers; count++){
    try {
      if(workers[count]){
          await workers[count].send({action: SET_PARTITIONS, data: partitions[count]})
      }else {
        const shards = partitions[count].join(" ")
        startWorker(shards)
      }
    } catch (error) {continue}
  }
}

( async () =>{


  generatePartitions()

  startWorkers()

  while(true){
    let t = timestamp()
    console.log(`[MASTER] Beginning to work on timestamp ${t}`);
    for(let count = 0; count < num_workers; count++){
      try {
        await workers[count].send({ action: SET_TIMESTAMP, data: t})
      } catch (error) {continue}
    }

    await sleep( 1000)
  }


  process.exit(0)

})();


