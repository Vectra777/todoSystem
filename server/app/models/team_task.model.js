module.exports = (connex, Sequelize) => {
    const TeamTask = connex.define('team_task', {
        team_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                model: 'teams',
                key: 'id'
            }
        },
        competence_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                model: 'competences',
                key: 'id'
            }
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });
    return TeamTask;
}