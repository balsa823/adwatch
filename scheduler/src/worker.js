// worker.js

const { SET_PARTITIONS, SET_TIMESTAMP } = require('./consts');

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));


let shard_numbers = process.argv[2].split(" ");

let timestamp

process.on('message', message => {
  switch(message.action){
    case SET_PARTITIONS:
      shard_numbers = message.data
      console.log(`[WORKER] ${process.pid} updated shards ${shard_numbers}`)
    break
    case SET_TIMESTAMP:
      timestamp = message.data
      console.log(`[WORKER] ${process.pid} updated timestamp to ${timestamp}`)
    break
    default:
      console.log(message)
  }
});

const doWork = async () => {
  const workCount = getRandomNumber(1, 15);

  for (let i = 0; i < workCount; i++) {
    console.log(`[WORKER] ${process.pid} is working... on shards ${shard_numbers}`);
    
    if(workCount == getRandomNumber(1, 15)) throw new Error()

    await sleep( 1000);
  }
};


 (async()=>{

  try {
    await doWork();
  } catch (error) {
    process.exit(1);
  }

  process.exit(0)
 

 })();
