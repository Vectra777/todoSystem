module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "admin",
  PASSWORD: process.env.DB_PASSWORD || "Fanfan0505",
  DB: process.env.DB_NAME || "db_todo",
  PORT: process.env.DB_PORT || 3306,
  dialect: "mysql",
};
