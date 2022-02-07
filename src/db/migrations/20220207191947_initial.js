/**
 * @typedef {import('knex')} Knex
 */

/**
* @param {Knex} knex
*/
exports.up = knex => {
  return knex.schema
    .createTable('todos', table => {
      table.increments('id')
        .primary()

      table.string('aggregateId')

      table.string('event')

      table.integer('eventVersion')
        .unsigned()

      table.json('header')

      table.json('payload')
    })
}

/**
* @param {Knex} knex
*/
exports.down = knex => {
  return knex.schema
    .dropTableIfExists('todos')
}
