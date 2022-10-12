import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 } from "uuid";
import { groupService, jwtTokenService } from '../../services'


export const getGroups = middyfy(async (): Promise<APIGatewayProxyResult> => {
    const groups = await groupService.getGroups();
    return formatJSONResponse ({
        groups
    })
})


export const createGroup = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = v4();
        const parsedBody = JSON.parse(event.body);
        const authorization = event.headers.Authorization;
        const split = authorization.split(' ');
        const jwtToken = split[1];

        const newGroup = {
            id : id,
            userId: jwtTokenService.getUserId(jwtToken),
            ...parsedBody
        };

        const group = await groupService.createGroup(newGroup);

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
    const body = JSON.parse(event.body);
    try {
        const group = await groupService.updateGroup(id, {
            name: body.name,
            description: body.description
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