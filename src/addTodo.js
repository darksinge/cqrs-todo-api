/**
 * @typedef {import('../types').Todo} Todo
 */

const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const { TABLE_NAME } = process.env

// Adds a todo to the database
exports.handler = async (event) => {
  /** @type {Todo} */
  const todo = JSON.parse(event.body)
  todo.id = todo.id.toString()

  await ddb.put({
    TableName: TABLE_NAME,
    Item: todo
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ todo })
  }
}
