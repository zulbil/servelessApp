import { handlerPath } from '@libs/handler-resolver';

export const rs256Auth0Authorizer = {
    handler: `${handlerPath(__dirname)}/handler.rs256Auth0Authorizer`
};


export const auth0Authorizer = {
    handler: `${handlerPath(__dirname)}/handler.auth0Authorizer`
};