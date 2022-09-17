import { handlerPath } from '@libs/handler-resolver';

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
  ],
};