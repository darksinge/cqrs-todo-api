/**
 * @typedef {import('../types').Todo} Todo
 */

const AWS = require('aws-sdk')
const knex = require('./db').connect()
const { DateTime } = require('luxon')
const { Events } = require('./events')

const sns = new AWS.SNS()
const TODO_DELETED_TOPIC = process.env.TODO_DELETED_TOPIC

const todoDeletedEvent = ({ aggregateId, revision }) => {
  return {
    aggregateId,
    event: Events.TodoDeleted,
    eventVersion: 1,
    header: {
      source: 'service-todos',
      revision,
      region: 'us-east-1',
      time: DateTime.now().toUTC().toISO(),
      topicArn: TODO_DELETED_TOPIC,
      traceId: aggregateId // Wouldn't actually do this in production
    },
    payload: {
      id: aggregateId
    }
  }
}

// Delete the todo from dynamodb by id
exports.handler = async (event) => {
  const aggregateId = event.pathParameters.id

  const revision = await knex('todos')
    .count('*')
    .where('aggregateId', '=', aggregateId)

  const deleteEvent = todoDeletedEvent({ aggregateId, revision: revision + 1 })
  await knex('todos')
    .insert(deleteEvent)

  await sns.publish({
    TopicArn: TODO_DELETED_TOPIC,
    Message: JSON.stringify(deleteEvent)
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' })
  }
}
