

const producer = require('./producer');


(async () => {
  await producer.run()
  process.exit(0)
})();

