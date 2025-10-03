require("dotenv").config({ path: `${process.cwd()}/.env` });

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    seederStorage: "sequelize",
    migrationStorage: "sequelize",
    migrationStorageTableName: "SequelizeMeta",
    migrations: {
      directory: "./db/migrations",
    },
    models: {
      directory: "./db/models",
    },
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    migrationStorage: "sequelize",
    migrationStorageTableName: "SequelizeMeta",
    migrations: {
      directory: "./db/migrations",
    },
    models: {
      directory: "./db/models",
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    seederStorage: "sequelize",
    migrationStorage: "sequelize",
    migrationStorageTableName: "SequelizeMeta",
    migrations: {
      directory: "./db/migrations",
    },
    models: {
      directory: "./db/models",
    },
  },
};
