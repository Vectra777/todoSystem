module.exports = (connex, Sequelize) => {
    const Company = connex.define('companies', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
    }, {
        timestamps: false
    });
    return Company;
}