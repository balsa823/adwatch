npm install --save sequelize
npm install --save sequelize-cli

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

node src/topic.js

node src/master.js