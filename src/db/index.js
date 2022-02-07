const Knex = require('knex')
const config = require('./config/knexfile')

exports.connect = () => Knex(config)
