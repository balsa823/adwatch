'use strict';

const db = require('../models')

module.exports = {
  up: async (queryInterface) => {
    
    await db.Role.create({
      id: 1,
      name: "user"
    });
   
    await db.Role.create({
      id: 2,
      name: "moderator"
    });
   
    await db.Role.create({
      id: 3,
      name: "admin"
    });
    
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('role', null, {});
  },
};
