const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()
const { TODOS_TABLE } = process.env

exports.handlers = async (event) => {
  const data = await ddb.get({
    TableName: TODOS_TABLE,
    Key: {
      id: event.pathParameters.id
    }
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(data.Item)
  }
}
