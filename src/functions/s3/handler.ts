import { SNSEvent, S3Event, S3EventRecord } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { connectionService } from '../../services'
import Jimp from 'jimp/es';

const stage = process.env.STAGE;
const apiId = process.env.API_ID;
const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

const s3 = new AWS.S3()
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

export const resizeImage = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await processImage(record)
    }
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

async function processImage(record: S3EventRecord) {
  const key = record.s3.object.key
  console.log('Processing S3 item with key: ', key)
  const response = await s3
    .getObject({
      Bucket: imagesBucketName,
      Key: key
    })
    .promise()

  const body = response.Body
  const image = await Jimp.read(body)

  console.log('Resizing image')
  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

  console.log(`Writing image back to S3 bucket: ${thumbnailBucketName}`)
  await s3
    .putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    })
    .promise()
}