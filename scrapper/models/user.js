const db = require('../models')

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
    },
    {
      tableName: 'user',
      modelName: 'User',
      timestamps: false,
    }
  );

  User.associate = (models) => {
    models.User.hasMany(models.Job, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'jobs'
    });


    models.User.belongsToMany(models.Role, {
      as: "roles",
      through: models.UserRoles,
      foreignKey: "user_id",
      otherKey: "role_id",
    });
  }

  
  return User
}




