// // Sample array of messages
// const messages = [
//   { site: 'sports', text: 'Message 1' },
//   { site: 'technology', text: 'Message 2' },
//   { site: 'sports', text: 'Message 3' },
//   { site: 'science', text: 'Message 4' },
//   { site: 'technology', text: 'Message 5' },
// ];

// // Use reduce to group messages by topic
// const topicsWithMessages = messages.reduce((acc, message) => {
//   const { site, text } = message;

//   // Check if the topic already exists in the accumulator
//   if (!acc[site]) {
//     acc[site] = [];
//   }

//   // Add the message to the corresponding topic
//   acc[site].push(text);

//   return acc;
// }, {});

// console.log(topicsWithMessages)

// // Convert the object into an array of topics
// const topicsArray = Object.entries(topicsWithMessages).map(([site, messages]) => ({
//   site,
//   messages,
// }));

// console.log(topicsArray);

const { ho_run } = require("./ho_scrapper");


(async () => {
  const result = await ho_run("golf 4")  
  console.log(JSON.stringify(result))
  process.exit(0)
})();

