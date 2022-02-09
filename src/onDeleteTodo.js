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
const onTodoDeleted = async (record) => {
  const event = JSON.parse(record.Sns.Message)
  console.log('TodoDeletedEvent:', JSON.stringify(event))

  const { id } = event.payload
  await ddb.delete({
    TableName: TODOS_TABLE,
    Key: {
      id
    }
  }).promise()
}

/**
   * Adds a todo to the database
   * @param {SNSEvent} event
   */
exports.handler = async ({ Records: records }) => {
  console.log('RECORDS:', JSON.stringify(records, null, 2))
  await Promise.all(records.map(onTodoDeleted))
}
