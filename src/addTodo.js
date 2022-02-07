/**
 * @typedef {import('../types').Todo} Todo
 * @typedef {import('aws-lambda').SNSEvent} SNSEvent
 * @typedef {import('aws-lambda').SNSEventRecord} SNSEventRecord
 * @typedef {import('aws-lambda').APIGatewayEvent} APIGatewayEvent
 */

import { DateTime } from 'luxon'
const knex = require('./db').connect()

const todoCreatedEventFromAggregate = ({ aggregateId, payload }) => {
  return {
    aggregateId,
    event: 'TodoCreated',
    eventVersion: 1,
    header: {
      revision: 0,
      source: 'service-todos',
      region: 'us-east-1',
      time: DateTime.now().toUTC().toISO(),
      traceId: aggregateId // Wouldn't actually do this in production
    },
    payload
  }
}

/**
 * Adds a todo to the database
 * @param {SNSEvent|APIGatewayEvent} event_
 */
exports.handler = async (event_) => {
  console.log('EVENT:', JSON.stringify(event_, null, 2))
  /** @type {Todo} */
  const todo = JSON.parse(event_.body)
  todo.id = todo.id.toString()

  const todoCreatedEvent = todoCreatedEventFromAggregate({
    aggregateId: todo.id,
    payload: {
      initialState: todo
    }
  })

  const { aggregateId, event, eventVersion, header, payload } = todoCreatedEvent
  await knex('todos')
    .insert({
      aggregateId,
      event,
      eventVersion,
      header,
      payload
    })

  return {
    statusCode: 200,
    body: JSON.stringify({ event: todoCreatedEvent })
  }
}
