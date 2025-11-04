module.exports = (connex, Sequelize) => {
    const TeamMember = connex.define('team_members', {
        team_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                model: 'teams',
                key: 'id'
            }
        },
        employee_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        role: {
            type: Sequelize.STRING
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });
    return TeamMember;
}