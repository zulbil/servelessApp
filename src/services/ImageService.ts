import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Image from "../models/Image";

export default class ImageService {
    private Tablename: string = process.env.IMAGES_TABLE;

    constructor(private docClient: DocumentClient) {}

    async getImageByGroup(groupId: string): Promise<Image[]> {
        const result = await this.docClient.query({
          TableName: this.Tablename,
          KeyConditionExpression: 'groupId = :groupId',
          ExpressionAttributeValues: {
            ':groupId': groupId
          },
          ScanIndexForward: false
        }).promise()
      
        return result.Items as Image[];
    }

}