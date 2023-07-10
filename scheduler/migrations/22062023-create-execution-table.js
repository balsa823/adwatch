'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('execution', {
      execution_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'job',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      worker_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      execution_result: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      shard: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('execution');
  },
};
