import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 } from "uuid";
import { groupService } from '../../services'
import express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'

const app = express();

app.get('/groups', async (_req, res) => {
    const groups = await groupService.getGroups();
  
    res.json({
      groups
    })
})

const server = awsServerlessExpress.createServer(app)

export const getGroups = (event: APIGatewayProxyEvent, context: any) => { awsServerlessExpress.proxy(server, event, context) }


export const createGroup = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = v4();
        const group = await groupService.createGroup({
            id: id,
            name: event.body.name,
            description: event.body.description,
        })
        return formatJSONResponse({
            group
        });
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
})


export const getGroup = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.id;
    try {
        const group = await groupService.getGroup(id)
        return formatJSONResponse({
            group, id
        });
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
})

export const updateGroup = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.id;
    try {
        const group = await groupService.updateGroup(id, {
            name: event.body.name,
            description: event.body.description
        });
        return formatJSONResponse({
            group, id
        });
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
})

export const deleteGroup = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.id;
    try {
        const group = await groupService.deleteGroup(id)
        return formatJSONResponse({
            group, id
        });
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
})