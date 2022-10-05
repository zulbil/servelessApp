import { handlerPath } from '@libs/handler-resolver';
import schema from './schema'

export const getGroups = {
  handler: `${handlerPath(__dirname)}/handler.getGroups`,
  events: [
    {
      http: {
        method: 'get',
        path: 'groups',
        cors: true
      }
    }
  ],
};

export const createGroup = {
    handler: `${handlerPath(__dirname)}/handler.createGroup`,
    events: [
      {
        http: {
          method: 'post',
          path: 'groups',
          request: {
            schemas: {
              'application/json': schema,
            }
          },
          cors: true,
          authorizer: 'rs256Auth0Authorizer'
        }
      }
    ],
  };

export const getGroup = {
  handler: `${handlerPath(__dirname)}/handler.getGroup`,
  events: [
    {
      http: {
        method: 'get',
        path: 'groups/{id}',
        cors: true
      }
    }
  ],
};

export const updateGroup = {
  handler: `${handlerPath(__dirname)}/handler.updateGroup`,
  events: [
    {
      http: {
        method: 'put',
        path: 'groups/{id}',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          }
        }
      }
    }
  ],
};

export const deleteGroup = {
  handler: `${handlerPath(__dirname)}/handler.deleteGroup`,
  events: [
    {
      http: {
        method: 'delete',
        path: 'groups/{id}',
        cors: true
      }
    }
  ],
};