/**
 * @typedef {import('../types').Todo} Todo
 */

const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const { TODOS_TABLE } = process.env

// Adds a todo to the database
exports.handler = async (event) => {
  /** @type {Todo} */
  const todo = JSON.parse(event.body)
  todo.id = todo.id.toString()

  const { Item: item = {} } = await ddb.get({
    TableName: TODOS_TABLE,
    Key: { id: todo.id }
  }).promise()

  await ddb.put({
    TableName: TODOS_TABLE,
    Item: {
      ...item,
      ...todo
    }
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ todo })
  }
}
