const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const { TODOS_TABLE } = process.env

// Gets all todos from dynamodb
exports.handler = async (event) => {
  const { Items: items } = await ddb.scan({
    TableName: TODOS_TABLE,
    Select: 'ALL_ATTRIBUTES'
  }).promise()

  console.log('data', JSON.stringify(items, null, 2))

  const todos = items.map(item => {
    const { revision, ...todo } = item
    return todo
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ todos })
  }
}
