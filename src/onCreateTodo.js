/**
 * @typedef {import('../types').Todo} Todo
 * @typedef {import('aws-lambda').SNSEvent} SNSEvent
 * @typedef {import('aws-lambda').SNSEventRecord} SNSEventRecord
 * @typedef {import('aws-lambda').APIGatewayEvent} APIGatewayEvent
 */

import { DateTime } from 'luxon'
const AWS = require('aws-sdk')
const knex = require('./db').connect()

const ddb = new AWS.DynamoDB.DocumentClient()

const events = {
  CreateTodo: 'CreateTodo',
  TodoCreated: 'TodoCreated'
}

const createEvent = ({ aggregateId, event, payload }) => {
  return {
    aggregateId,
    event,
    header: {
      version: 1,
      source: 'service-todos',
      region: 'us-east-1',
      time: DateTime.now().toUTC().toISO()
    },
    payload
  }
}

const { TODOS_TABLE, TODOS_EVENT_LOG_TABLE } = process.env

/**
  * @param {SNSEventRecord[]} records
  */
const onTodoCreatedEvent = async (records) => {

}

/**
  * Adds a todo to the database
  * @param {APIGatewayEvent} event
  */
const onCreateTodoEvent = async (event) => {
  /** @type {Todo} */
  const todo = JSON.parse(event.body)
  todo.id = todo.id.toString()

  await ddb.put({
    TableName: TODOS_EVENT_LOG_TABLE,
    Item: todo
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ todo })
  }
}

/**
  * Adds a todo to the database
  * @param {SNSEvent|APIGatewayEvent} event
  */
exports.handler = async (event) => {
  console.log('EVENT:', JSON.stringify(event, null, 2))
  if (event.Records) {
    // query
    return await onTodoCreatedEvent(event.Records)
  } else {
    // command
    return await onCreateTodoEvent(event)
  }
}

