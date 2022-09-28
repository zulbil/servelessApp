import { handlerPath } from '@libs/handler-resolver';

export const sendUploadNotifications = {
    environment: {
        STAGE: '${self:provider.stage}',
        API_ID: {
            'Fn::Join' : [
                '',
                [
                    '.execute-api.',
                    { Ref: 'AWS::Region' },
                    '.amazonaws.com/',
                    '${self:provider.stage}'
                ]
            ]
        } 
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