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
const onTodoArchived = async (record) => {
  const event = JSON.parse(record.Sns.Message)
  console.log('TodoEvent:', JSON.stringify(event))

  const { revision } = event.header
  const { id } = event.payload
  const { Item: item } = await ddb.get({
    TableName: TODOS_TABLE,
    Key: { id }
  }).promise()

  await ddb.put({
    TableName: TODOS_TABLE,
    Item: {
      ...item,
      revision,
      archived: true
    }
  }).promise()
}

/**
 * Adds a todo to the database
 * @param {SNSEvent} event
 */
exports.handler = async ({ Records: records }) => {
  console.log('RECORDS:', JSON.stringify(records, null, 2))
  await Promise.all(records.map(onTodoArchived))
}
