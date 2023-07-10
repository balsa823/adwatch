module.exports = (sequelize, Sequelize) => {
  const UserRoles = sequelize.define(
    'UserRoles',
    {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      role_id: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    },
    {
      tableName: 'user_roles',
      modelName: 'UserRoles',
      timestamps: false,
    }
  );

  UserRoles.associate = (models) => {
    models.UserRoles.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

    models.UserRoles.belongsTo(models.Role, {
      foreignKey: "role_id",
      targetKey: "id",
    });
  }

  
  return UserRoles
}




