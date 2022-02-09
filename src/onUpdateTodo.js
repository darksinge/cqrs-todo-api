/**
 * @typedef {import('../types').Todo} Todo
 * @typedef {import('aws-lambda').SNSEvent} SNSEvent
 * @typedef {import('aws-lambda').SNSEventRecord} SNSEventRecord
 */

const AWS = require('aws-sdk')

const ddb = new AWS.DynamoDB.DocumentClient()
const TODOS_TABLE = process.env.TODOS_TABLE

/**
  * @param {SNSEventRecord} record
  */
const onTodoUpdated = async (record) => {
  const event = JSON.parse(record.Sns.Message)
  console.log('event:', JSON.stringify(event))

  /** @type {{ state: Todo }} */
  const { state: todo } = event.payload
  todo.id = todo.id.toString()

  const { revision } = event.header

  await ddb.put({
    TableName: TODOS_TABLE,
    Item: {
      ...todo,
      revision
    }
  }).promise()
}

/**
  * Adds a todo to the database
  * @param {SNSEvent} event
  */
exports.handler = async ({ Records: records }) => {
  console.log('RECORDS:', JSON.stringify(records, null, 2))
  await Promise.all(records.map(onTodoUpdated))
}
