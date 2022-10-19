import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

const dynamoDBClient = (): DocumentClient => {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:9800",
    }); 
  }
  return new XAWS.DynamoDB.DocumentClient();
};

export default dynamoDBClient; 