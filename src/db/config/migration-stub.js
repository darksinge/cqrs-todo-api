/**
 * @typedef {import('knex')} Knex
 */

/**
* @param {Knex} knex
*/
exports.up = knex => {
  return knex.schema
}

/**
* @param {Knex} knex
*/
exports.down = knex => {
  return knex.schema
}
