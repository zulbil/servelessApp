import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import Image from "../models/Image";

export default class ImageService {
    private tableName: string = process.env.IMAGES_TABLE;
    private indexName: string = process.env.IMAGES_ID_INDEX;
    private bucketName: string = process.env.IMAGES_S3_BUCKET
    private urlExpiration: number = 300;

    private s3: any = new AWS.S3({ signatureVersion: 'v4' });

    constructor(private docClient: DocumentClient) {}

    async getImageByGroup(groupId: string): Promise<Image[]> {
        const result = await this.docClient.query({
          TableName: this.tableName,
          KeyConditionExpression: 'groupId = :groupId',
          ExpressionAttributeValues: {
            ':groupId': groupId
          },
          ScanIndexForward: false
        }).promise()
      
        return result.Items as Image[];
    }

    async getImage(imageId: string) : Promise<any> {
        const result = await this.docClient.query({
            TableName : this.tableName,
            IndexName : this.indexName,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': imageId
            }
        }).promise()

        if (result.Count == 0) {
            return null;
          }

        return result.Items[0]; 
    }

    async createImage(image: Image): Promise<Image> {
      image.url = `https://${this.bucketName}.s3.amazonaws.com/${image.id}`;
      await this.docClient.put({
          TableName: this.tableName,
          Item: image
      }).promise()
      return image;
    }

    getUploadUrl(imageId: string): string {
      return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: imageId,
        Expires: this.urlExpiration
      })
    }

}