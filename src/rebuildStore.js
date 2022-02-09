/**
 * @typedef {import('../types').Todo} Todo
 * @typedef {import('aws-lambda').SQSEvent} SQSEvent
 * @typedef {import('aws-lambda').SQSRecord} SQSRecord
 */

const _ = require('lodash')
const AWS = require('aws-sdk')
const knex = require('./db').connect()

AWS.config.region = process.env.AWS_REGION ?? 'us-east-1'

const sqs = new AWS.SQS()
const sns = new AWS.SNS()
const ddb = new AWS.DynamoDB.DocumentClient()

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL
const TODOS_TABLE = process.env.TODOS_TABLE || 'todo-dev'

const dropReadModel = async () => {
  const { Items } = await ddb.scan({
    TableName: TODOS_TABLE
  }).promise()

  for (const item of Items) {
    await ddb.delete({
      TableName: TODOS_TABLE,
      Key: {
        id: item.id
      }
    }).promise()
  }

  return Items
}

// Queues up all events in event log
exports.rebuildStore = async event => {
  await dropReadModel()

  const events = await knex('todos')

  // Events need to be published in order they were recieved, so place them in a
  // FIFO SQS Queue, grouped by aggregateId
  const messageGroups = _.groupBy(events, 'aggregateId')

  for (const groupId in messageGroups) {
    const group = messageGroups[groupId]
    for (const events of _.chunk(group, 10)) {
      await sqs.sendMessageBatch({
        QueueUrl: SQS_QUEUE_URL,
        Entries: events.map((event, i) => ({
          Id: event.aggregateId,
          MessageBody: JSON.stringify(event),
          MessageGroupId: groupId,
          MessageDeduplicationId: `${event.aggregateId}-${event.id}`
        }))
      }).promise()
    }
  }
}

/**
 * Publishes events recieved from SQS queue
 * @param {SQSEvent} event
 */
exports.rebuildFromEventQueue = async event => {
  console.log('SQS EVENT:', JSON.stringify(event, null, 2))
  const events = event.Records.map(record => record.body)
    .map(body => JSON.parse(body))

  console.log('TODO EVENTS:', JSON.stringify(event, null, 2))

  await Promise.all(
    events.map(event => {
      return {
        event,
        topicArn: event.header.topicArn
      }
    })
      .map(({ topicArn, event }) =>
        sns
          .publish({
            TopicArn: topicArn,
            Message: JSON.stringify(event)
          })
          .promise()
      )
  )
}
