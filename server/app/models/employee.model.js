module.exports = (connex, Sequelize) => {
    const Employee = connex.define('employees', {
        id: {
            type: Sequelize.STRING(10),
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            validate: {
                is: /^e[0-9]+$/i
            }
        },
        firstname: {
            type: Sequelize.STRING
        },
        lastname: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password_hash: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updated_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });
    return Employee;
}