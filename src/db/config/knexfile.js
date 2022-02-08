const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

module.exports = {
  local: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'password123',
      port: 3306,
      database: 'todos'
    },
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
      tableName: 'knex_migrations',
      stub: path.join(__dirname, 'migration-stub.js')
    }
  },
  fromEnv: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: 3306,
      database: 'todos'
    },
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
      tableName: 'knex_migrations',
      stub: path.join(__dirname, 'migration-stub.js')
    }
  }
}
