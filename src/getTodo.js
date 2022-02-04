const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()
const { TABLE_NAME } = process.env

exports.handlers = async (event) => {
  const data = await ddb.get({
    TableName: TABLE_NAME,
    Key: {
      id: event.pathParameters.id
    }
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(data.Item)
  }
}
