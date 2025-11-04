module.exports = (connex, Sequelize) => {
    const File = connex.define('files', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
       created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
       competence_ID: {
            type: Sequelize.INTEGER,
            references: {
                model: 'competences',
                key: 'id'
            }
        },
        extension: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        }
    });
    return File;
}