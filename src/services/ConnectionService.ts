import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Connection from "../models/Connection";

export default class ConnectionService {
    private Tablename: string = process.env.CONNECTIONS_TABLE;

    constructor(private docClient: DocumentClient) {}

    async getConnections() : Promise<Connection[]> {
        const connections = await this.docClient.scan({
            TableName: this.Tablename
        }).promise()

        return connections.Items as Connection[];
    }

    async createConnection(connection: Connection): Promise<Connection> {
        await this.docClient.put({
            TableName: this.Tablename,
            Item: connection
        }).promise()
        return connection;

    }

    async deleteConnection(id: string): Promise<string> {
        await this.docClient.delete({
            TableName: this.Tablename,
            Key: { id }
        }).promise();
        return id; 
    }
}