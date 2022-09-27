import { handlerPath } from '@libs/handler-resolver';

export const sendUploadNotifications = {
    handler: `${handlerPath(__dirname)}/handler.sendNotification`
};