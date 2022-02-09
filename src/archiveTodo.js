/**
 * @typedef {import('../types').Todo} Todo
 */

const AWS = require('aws-sdk')
const knex = require('./db').connect()
const { DateTime } = require('luxon')
const { Events } = require('./events')

const sns = new AWS.SNS()
const TODO_ARCHIVED_EVENT = process.env.TODO_ARCHIVED_EVENT

const todoArchivedEvent = ({ aggregateId, revision }) => {
  return {
    aggregateId,
    event: Events.TodoArchived,
    eventVersion: 1,
    header: {
      source: 'service-todos',
      revision,
      region: 'us-east-1',
      time: DateTime.now().toUTC().toISO(),
      topicArn: TODO_ARCHIVED_EVENT,
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

  const [{ revision }] = await knex('todos')
    .count('* as revision')
    .where('aggregateId', '=', aggregateId)

  const archiveEvent = todoArchivedEvent({ aggregateId, revision: +revision + 1 })
  await knex('todos')
    .insert(archiveEvent)

  await sns.publish({
    TopicArn: TODO_ARCHIVED_EVENT,
    Message: JSON.stringify(archiveEvent)
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ event: archiveEvent })
  }
}
