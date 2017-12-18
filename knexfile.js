module.exports = {
  development: {
    client: 'pg',
    connection: {
      filename: 'postgres://localhost/garage',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds/dev',
    },
    useNullAsDefault: true,
  },
};
