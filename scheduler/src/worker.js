// worker.js

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));


let shard_numbers = process.argv[2].split(" ");



process.on('message', message => {
  shard_numbers = message
  console.log(`[WORKER] ${process.pid} updated shards ${shard_numbers}`);
});



const doWork = async () => {
  const workCount = getRandomNumber(1, 15);

  for (let i = 0; i < workCount; i++) {
    console.log(`[WORKER] ${process.pid} is working... on shards ${shard_numbers}`);
    await sleep(500);

    if(workCount == getRandomNumber(1, 15)) throw new Error()


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
