import { handlerPath } from '@libs/handler-resolver';

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