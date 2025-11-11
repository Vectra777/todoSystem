const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const connex = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: 3306,
    operatorsAliases: false,
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const db = {};
db.Sequelize = Sequelize;
db.connex = connex;
db.employees = require('./employee.model.js')(connex, Sequelize);
db.competences = require('./competence.model.js')(connex, Sequelize);
db.files = require('./file.model.js')(connex, Sequelize);
db.teams = require('./team.model.js')(connex, Sequelize);
db.team_members = require('./team_member.model.js')(connex, Sequelize);
db.user_tasks = require('./user_task.model.js')(connex, Sequelize);
db.team_tasks = require('./team_task.model.js')(connex, Sequelize);

// Define associations
// Teams & Employees (Many-to-Many)
db.teams.belongsToMany(db.employees, {
    through: db.team_members,
    foreignKey: 'team_id',
    otherKey: 'employee_id'
});

db.employees.belongsToMany(db.teams, {
    through: db.team_members,
    foreignKey: 'employee_id',
    otherKey: 'team_id'
});

// Direct associations with team_members junction table
db.team_members.belongsTo(db.employees, {
    foreignKey: 'employee_id'
});

db.team_members.belongsTo(db.teams, {
    foreignKey: 'team_id'
});

db.employees.hasMany(db.team_members, {
    foreignKey: 'employee_id'
});

db.teams.hasMany(db.team_members, {
    foreignKey: 'team_id'
});

// Files & Competences (One-to-Many)
db.competences.hasMany(db.files, {
    foreignKey: 'competence_id'
});
db.files.belongsTo(db.competences, {
    foreignKey: 'competence_id'
});

// User Tasks (Many-to-Many between Employees and Competences)
db.employees.belongsToMany(db.competences, {
    through: db.user_tasks,
    foreignKey: 'employee_id',
    otherKey: 'competence_id'
});

db.competences.belongsToMany(db.employees, {
    through: db.user_tasks,
    foreignKey: 'competence_id',
    otherKey: 'employee_id'
});

// Team Tasks (Many-to-Many between Teams and Competences)
db.teams.belongsToMany(db.competences, {
    through: db.team_tasks,
    foreignKey: 'team_id',
    otherKey: 'competence_id'
});

db.competences.belongsToMany(db.teams, {
    through: db.team_tasks,
    foreignKey: 'competence_id',
    otherKey: 'team_id'
});

// Direct associations with team_tasks junction table
db.team_tasks.belongsTo(db.teams, {
    foreignKey: 'team_id'
});

db.team_tasks.belongsTo(db.competences, {
    foreignKey: 'competence_id'
});

db.teams.hasMany(db.team_tasks, {
    foreignKey: 'team_id'
});

db.competences.hasMany(db.team_tasks, {
    foreignKey: 'competence_id'
});

// Direct associations with user_tasks junction table
db.user_tasks.belongsTo(db.employees, {
    foreignKey: 'employee_id'
});

db.user_tasks.belongsTo(db.competences, {
    foreignKey: 'competence_id'
});

db.employees.hasMany(db.user_tasks, {
    foreignKey: 'employee_id'
});

db.competences.hasMany(db.user_tasks, {
    foreignKey: 'competence_id'
});

module.exports = db;