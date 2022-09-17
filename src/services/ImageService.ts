import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Image from "../models/Image";

export default class ImageService {
    private tableName: string = process.env.IMAGES_TABLE;
    private indexName: string = process.env.IMAGES_ID_INDEX;

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

}