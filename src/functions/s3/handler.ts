import { SNSHandler, SNSEvent } from 'aws-lambda';


export const sendNotification: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
      const s3EventStr = snsRecord.s3.object.key;
      console.log('Processing S3 event key :', s3EventStr)
    }
}