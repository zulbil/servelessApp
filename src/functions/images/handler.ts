import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 } from "uuid";

export const getImagesByGroup = middyfy(async (): Promise<APIGatewayProxyResult> => {
    return formatJSONResponse ({
        items : []
    })
})