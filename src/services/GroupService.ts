import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Group from "../models/Group";

export default class GroupService {
    private Tablename: string = process.env.GROUPS_TABLE;

    constructor(private docClient: DocumentClient) {}

    async getGroups() : Promise<Group[]> {
        const groups = await this.docClient.scan({
            TableName: this.Tablename
        }).promise()

        return groups.Items as Group[];
    }

    async createGroup(group: Group): Promise<Group> {
        await this.docClient.put({
            TableName: this.Tablename,
            Item: group
        }).promise()
        return group;

    }

    async getGroup(id: string): Promise<any> {
        const group = await this.docClient.get({
            TableName: this.Tablename,
            Key: {
                id: id
            }
        }).promise()
        if (!group.Item) {
            throw new Error("Id does not exit");
        }
        return group.Item as Group;
    }

    async updateGroup(id: string, group: Partial<Group>): Promise<Group> {
        const updated = await this.docClient
            .update({
                TableName: this.Tablename,
                Key: { id },
                UpdateExpression:
                    "set #name = :name, #description = :description",
                ExpressionAttributeNames: {
                    "#name": "name",
                    "#description": "description"
                },
                ExpressionAttributeValues: {
                    ":name": group.name,
                    ":description": group.description
                },
                ReturnValues: "ALL_NEW",
            })
            .promise();
        return updated.Attributes as Group;
    }

    async deleteGroup(id: string): Promise<any> {
        return await this.docClient.delete({
            TableName: this.Tablename,
            Key: { id }
        }).promise();
    }
}