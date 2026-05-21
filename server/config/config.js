require('dotenv').config();

const buildConfig = (database) => ({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  dialect: 'postgres',
});

module.exports = {
  development: buildConfig(process.env.DB_NAME_DEV),
  test: buildConfig(process.env.DB_NAME_TEST),
  production: buildConfig(process.env.DB_NAME_PROD),
};