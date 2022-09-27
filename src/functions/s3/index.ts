import { handlerPath } from '@libs/handler-resolver';

export const sendUploadNotifications = {
    environment: {
        STAGE: '${self:provider.stage}',
        //API_ID: { Ref : 'WebsocketsApi' }
    },
    handler: `${handlerPath(__dirname)}/handler.sendNotification`,
    events: [
        {
            sns: {
                arn: {
                    'Fn::Join': [
                        ':',
                        [
                            'arn:aws:sns',
                            { Ref: 'AWS::Region' },
                            { Ref: 'AWS::AccountId' },
                            '${self:custom.topicName}'
                        ]
                    ]
                },
                topicName: '${self:custom.topicName}'
            }
        }
    ]
    
};