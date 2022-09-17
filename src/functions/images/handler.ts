import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 } from "uuid";
import { groupService, imageService} from '../../services'

export const getImagesByGroup = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters.id;
        const validGroup = !!groupService.getGroup(id);

        if (!validGroup) {
            return formatJSONResponse({
                error: `Group ${id} doesn't exist`
            }, 404); 
        }
        const images = await imageService.getImageByGroup(id);

        return formatJSONResponse ({
            items: images
        })
    } catch (error) {
        return formatJSONResponse({
            status: 500,
            message: error
        });
    }
})

export const getImage = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters.id;
        const image = await imageService.getImage(id);

        if(!image) {
            return formatJSONResponse ({
                item: null
            })
        }

        return formatJSONResponse ({
            item: image
        })
    } catch (error) {
        return formatJSONResponse({
            status: 500,
            message: error
        });
    }
})