const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const { TABLE_NAME } = process.env

// Gets all todos from dynamodb
exports.handler = async (event) => {
  const data = await ddb.scan({
    TableName: TABLE_NAME,
    Select: 'ALL_ATTRIBUTES'
  }).promise()

  console.log('data', JSON.stringify(data, null, 2))

  return {
    statusCode: 200,
    body: JSON.stringify({ todos: data.Items })
  }
}
