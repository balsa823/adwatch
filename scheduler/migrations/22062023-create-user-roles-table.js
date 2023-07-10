'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_roles', {
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'role',
          key: 'id',
        },
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        primaryKey: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_roles');
  },
};
