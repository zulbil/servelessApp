import { handlerPath } from '@libs/handler-resolver';
import schema from './schema';

export const getImage = {
  handler: `${handlerPath(__dirname)}/handler.getImage`,
  events: [
    {
      http: {
        method: 'get',
        path: 'images/{id}',
        cors: true
      }
    }
  ]
};

export const getImagesByGroup = {
  handler: `${handlerPath(__dirname)}/handler.getImagesByGroup`,
  events: [
    {
      http: {
        method: 'get',
        path: 'groups/{id}/images',
        cors: true
      }
    }
  ]
};

export const createImage = {
  handler: `${handlerPath(__dirname)}/handler.createImage`,
  events: [
    {
      http: {
        method: 'post',
        path: 'groups/{id}/images',
        request: {
          schemas: {
            'application/json': schema,
          }
        },
        cors: true,
        authorizer: 'rs256Auth0Authorizer'
      }
    }
  ]
};