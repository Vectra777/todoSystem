module.exports = (connex, Sequelize) => {
    const Team = connex.define('teams', {
        id: {
            type: Sequelize.STRING(10),
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            validate: {
                is: /^t[0-9]+$/i
            }
        },
        team_name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        timestamps: false
    });
    return Team;
}