module.exports = (sequelize, Sequelize) => {
  const Execution = sequelize.define(
    'Execution', 
    {
      execution_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
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
    },
    {
      tableName: 'execution',
      modelName: 'Execution',
      timestamps: false
    }
  );

  Execution.associate = (models) => {
    models.Execution.belongsTo(models.Job, {
      foreignKey: 'job_id',
      target_key: 'id',
      as: 'job'
    });
  }

  return Execution
}




