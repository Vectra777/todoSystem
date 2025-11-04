module.exports = (connex, Sequelize) => {
  const UserTask = connex.define("user_tasks", {
    competence_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'competences',
        key: 'id'
      }
    },
    employee_id: {
      type: Sequelize.STRING(10),
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    employee_review: {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'employee_review'
    },
    hr_review: {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'hr_review'
    },
  });
  return UserTask;
};
