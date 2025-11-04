module.exports = (connex, Sequelize) => {
    const Competence = connex.define('competences', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updated_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        start_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        end_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        label: {
            type: Sequelize.STRING,
            allowNull: true
        }

      
    });
    return Competence;
}