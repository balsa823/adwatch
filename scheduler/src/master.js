const { fork } = require('child_process');

// Create an array to hold references to the spawned workers

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const min_num_workers = 2

let num_workers = process.argv[2]
const num_partitions = process.argv[3]
const workers = []
let partitions = []

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
  const worker = fork('worker.js', [shard_numbers]);

  worker.on('exit', () => {
    console.log(`[MASTER] Worker ${worker.pid} has died.`);
  
    const index = workers.indexOf(worker);
    if (index !== -1) workers.splice(index, 1)
    num_workers = num_workers - 1
   
    for(let count = 0; count < num_workers; count++){
      try {
        workers[count].send(partitions[count])
      } catch (error) {continue}
    }
    generatePartitions()

  });

  workers.push(worker);

  console.log(`[MASTER] Started worker ${worker.pid}`);
};

const startWorkers = () => {
  for(let count = 0; count < num_workers; count++){

    if(workers[count]){
      try {
        workers[count].send(partitions[count])
      } catch (error) {continue}
    }else {
      const shards = partitions[count].join(" ")
      startWorker(shards)
    }

  }
}

( async () =>{


  while(true){
    generatePartitions()
    startWorkers()
    while(workers.length >= min_num_workers ) await sleep(1000)

    num_workers = min_num_workers

  }

})();


