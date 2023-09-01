module.exports = (sequelize, Sequelize) => {
  const Job = sequelize.define(
    'Job', 
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      retry_times: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      description: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      interval: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    }, 
    {
      tableName: 'job',
      modelName: 'Job',
      timestamps: false
    }
  );

  Job.associate = (models) => {
    models.Job.belongsTo(models.User, {
      foreignKey: 'user_id',
      target_key: 'id',
      as: 'user'
    });
    
    models.Job.hasMany(models.Execution, {
      foreignKey: 'job_id',
      target_key: 'id',
      as: 'executions'
    })

  }

  return Job
}




