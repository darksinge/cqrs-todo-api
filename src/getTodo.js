const AWS = require('aws-sdk')

AWS.config.region = process.env.AWS_REGION || 'us-east-1'

const ddb = new AWS.DynamoDB.DocumentClient()
const TODOS_TABLE = process.env.TODOS_TABLE || 'todo-dev'

const notFoundHandler = () => {
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: 'Not Found'
    })
  }
}

exports.handler = async (event) => {
  console.log('EVENT:', JSON.stringify(event, null, 2))

  const { Item: item } = await ddb.get({
    TableName: TODOS_TABLE,
    Key: {
      id: event.pathParameters.id
    }
  }).promise()

  if (!item) {
    return notFoundHandler()
  }

  const revision = event.queryStringParameters?.revision
  if (revision && +item.revision !== +revision) {
    return notFoundHandler()
  }

  return {
    statusCode: 200,
    body: JSON.stringify(item)
  }
}
