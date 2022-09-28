import { handlerPath } from '@libs/handler-resolver';

export const connect = {
    handler: `${handlerPath(__dirname)}/handler.connect`,
    events: [
        {
            websocket: {
                route: "$connect"
            }
        }
    ]
};

export const disconnect = {
    handler: `${handlerPath(__dirname)}/handler.disconnect`,
    events: [
        {
            websocket: {
                route: "$disconnect"
            }
        }
    ]
};