const { fork } = require('child_process');
const {SET_TIMESTAMP} = require('./consts')

let num_workers = process.env.SCHEDULER_REPLICATION_FACTOR
const num_partitions = process.env.PARTITION_COUNT
const workers = Array(num_workers)
let partitions = []

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));
const timestamp = (now = new Date()) => (Math.floor(now.getTime() / 1000))

const generatePartitions = () => {
  let worker_index = 0
  let partitions = []
  for (let i = 0; i < num_partitions; i++) {
    if ( ! partitions[worker_index]) partitions[worker_index] = [i]
    else partitions[worker_index].push(i)

    worker_index += 1
    if(worker_index == num_workers ) worker_index = 0
  }
  return partitions
}

const startWorker = (index) => {
  const shards = partitions[index].join(" ")

  const worker = fork('src/worker.js', [shards])

  worker.on('exit', async () => {
    console.log(`[MASTER] Worker ${worker.pid} has died.`)
  
    const index = workers.indexOf(worker)
    startWorker(index)
  })

  workers[index] = worker
  console.log(`[MASTER] Started worker ${worker.pid}`);
}

const startWorkers = () => {
  for(let index = 0; index < num_workers; index++) startWorker(index)
}

(async () =>{

  partitions = generatePartitions()
  startWorkers()

  while(true){
    let t = timestamp()
    console.log(`[MASTER] Beginning to work on timestamp ${t}`);
    for(let count = 0; count < num_workers; count++){
      try {
        await workers[count].send({ action: SET_TIMESTAMP, data: t})
      } catch (error) {continue}
    }

    await sleep(1000)
  }

})();


