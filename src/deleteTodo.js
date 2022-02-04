/**
 * @typedef {import('../types').Todo} Todo
 */

const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const { TABLE_NAME } = process.env

// Delete the todo from dynamodb by id
exports.handler = async (event) => {
  const data = await ddb.delete({
    TableName: TABLE_NAME,
    Key: {
      id: event.pathParameters.id
    }
  }).promise()

  console.log(`deleted todo ${event.pathParameters.id}:`, JSON.stringify(data, null, 2))

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' })
  }
}
