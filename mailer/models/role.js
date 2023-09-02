module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING
      }
    },
    {
      tableName: 'role',
      modelName: 'Role',
      timestamps: false
    });


  Role.associate = (models) => {
    models.Role.belongsToMany(models.User, {
      as: "users",
      through: models.UserRoles,
      foreignKey: "role_id",
      otherKey: "user_id"
    })

  }

  return Role;
};