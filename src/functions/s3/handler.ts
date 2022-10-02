import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as util from 'util'
import { connectionService } from '../../services'

const stage = process.env.STAGE;
const apiId = process.env.API_ID;

const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
} 

const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi(connectionParams);

export const sendNotification = async (snsEvent: SNSEvent) => {

  try {
    console.log(connectionParams);
    for (const snsRecord of snsEvent.Records) {
      const s3EventStr = snsRecord.Sns.Message
      console.log('Processing S3 event', s3EventStr)
      const s3Event = JSON.parse(s3EventStr)

      await processS3Event(s3Event)
    }

  } catch (error) {
    console.log("Something went wrong: ",error.message);
  }
  
}

async function processS3Event(s3Event: S3Event) {
  for (const record of s3Event.Records) {
    const key = record.s3.object.key
    console.log('Processing S3 item with key: ', key)

    const connections = await connectionService.getConnections();

    const payload = {
        imageId: key
    }

    for (const connection of connections) {
        const connectionId = connection.id
        await sendMessageToClient(connectionId, payload)
    }
  }
}

async function sendMessageToClient(connectionId, payload) {
  try {
    console.log('Sending message to a connection', connectionId)

    await apigatewaymanagementapi.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload),
    }).promise()

  } catch (e) {
    console.log('Failed to send message', JSON.stringify(e))
    if (e.statusCode === 410) {
      console.log('Stale connection')

      await connectionService.deleteConnection(connectionId);

    }
  }
}