/**
 * @typedef {import('../types').Todo} Todo
 * @typedef {import('aws-lambda').APIGatewayEvent} APIGatewayEvent
 */

const AWS = require('aws-sdk')
const { DateTime } = require('luxon')
const knex = require('./db').connect()

const TODO_CREATED_TOPIC = process.env.TODO_CREATED_TOPIC

const sns = new AWS.SNS()

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
 * @param {APIGatewayEvent} event_
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

  await sns.publish({
    TopicArn: TODO_CREATED_TOPIC,
    Message: JSON.stringify(todoCreatedEvent)
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ event: todoCreatedEvent })
  }
}
