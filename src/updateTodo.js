/**
 * @typedef {import('../types').Todo} Todo
 * @typedef {import('aws-lambda').APIGatewayEvent} APIGatewayEvent
 */

const AWS = require('aws-sdk')
const { DateTime } = require('luxon')
const knex = require('./db').connect()
const { Events } = require('./events')

const TODO_UPDATED_TOPIC = process.env.TODO_UPDATED_TOPIC

const sns = new AWS.SNS()

const todoUpdatedEvent = ({ aggregateId, payload, revision }) => {
  return {
    aggregateId,
    event: Events.TodoUpdated,
    eventVersion: 1,
    header: {
      revision: 0,
      source: 'service-todos',
      region: 'us-east-1',
      time: DateTime.now().toUTC().toISO(),
      topicArn: TODO_UPDATED_TOPIC,
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

  const [{ revision }] = await knex('todos')
    .count('* as revision')
    .where('aggregateId', '=', todo.id)

  const updateEvent = todoUpdatedEvent({
    aggregateId: todo.id,
    revision: revision + 1,
    payload: {
      snapshot: todo
    }
  })

  await knex('todos')
    .insert(updateEvent)

  await sns.publish({
    TopicArn: TODO_UPDATED_TOPIC,
    Message: JSON.stringify(updateEvent)
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ event: updateEvent })
  }
}
