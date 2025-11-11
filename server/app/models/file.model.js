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
        competence_id: {
            type: Sequelize.INTEGER,
            field: 'competence_id',
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
        },
        original_name: {
            type: Sequelize.STRING
        },
        stored_name: {
            type: Sequelize.STRING
        },
        mime_type: {
            type: Sequelize.STRING
        },
        size: {
            type: Sequelize.INTEGER
        },
        uploaded_by: {
            type: Sequelize.STRING(10),
            references: {
                model: 'employees',
                key: 'id'
            }
        }
    }, {
        timestamps: false
    });
    return File;
}