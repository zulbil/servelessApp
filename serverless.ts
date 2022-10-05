import type { AWS } from '@serverless/typescript';

import {getGroups, createGroup, getGroup, updateGroup, deleteGroup } from '@functions/groups';
import { getImagesByGroup, getImage, createImage } from '@functions/images';
import { connect, disconnect } from '@functions/websocket';
import { sendUploadNotifications, resizeImage } from '@functions/s3';
import { rs256Auth0Authorizer, auth0Authorizer } from '@functions/auth';

const serverlessConfiguration: AWS = {
  service: 'servelessapp',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local', 'serverless-aws-documentation'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      GROUPS_TABLE: 'Groups-${self:provider.stage}',
      IMAGES_TABLE: 'Images-${self:provider.stage}',
      IMAGES_ID_INDEX: 'ImageIdIndex',
      IMAGES_S3_BUCKET: 'serveless-bucket-${self:provider.stage}',
      CONNECTIONS_TABLE: 'Connections-${self:provider.stage}',
      THUMBNAILS_S3_BUCKET: 'serveless-thumbnail-${self:provider.stage}', 
      APP_NAME: 'servelessapp',
      AUTH_0_SECRET_ID: 'Auth0Secret-${self:provider.stage}',
      AUTH_0_SECRET_FIELD: 'auth0Secret'
    },
    iam: {
      role: {
        statements: [{
          Effect: "Allow",
          Action: [
            "dynamodb:DescribeTable",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}",
        },
        {
          Effect: "Allow",
          Action: [
            "dynamodb:DescribeTable",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}'
        },
        {
          Effect: "Allow",
          Action: [
            "dynamodb:Scan",
            "dynamodb:PutItem",
            "dynamodb:DeleteItem",
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.CONNECTIONS_TABLE}'
        },
        {
          Effect: "Allow",
          Action: [
            "dynamodb:Query"
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}/index/${self:provider.environment.IMAGES_ID_INDEX}'
        }, 
        {
          Effect: "Allow",
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: 'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*'
        },
        {
          Effect: "Allow",
          Action: ['s3:PutObject'],
          Resource: 'arn:aws:s3:::${self:provider.environment.THUMBNAILS_S3_BUCKET}/*'
        }
      ]
      },
    }
  },
  // import the function via paths
  functions: { 
    getGroups, 
    createGroup, 
    getGroup, 
    updateGroup, 
    deleteGroup,
    getImagesByGroup,
    getImage,
    createImage,
    sendUploadNotifications,
    resizeImage,
    connect,
    disconnect,
    rs256Auth0Authorizer,
    auth0Authorizer
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      start:{
        port: 9800,
        inMemory: true,
        migrate: true,
      },
      stages: "dev"
    },
    topicName: 'imagesTopic-${self:provider.stage}',
    documentation : {
      api: {
        info: {
          version: 'v1.0.0',
          title: 'Udagram API',
          description: 'Serverless application for images sharing'
        }
      }
    }
  },
  resources: {
    Resources: {
      GatewayresponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,OPTIONS,POST'"
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: { Ref: 'ApiGatewayRestApi' }
        }
      },
      KMSKey: {
        Type: 'AWS::KMS::Key',
        Properties: {
          Description: 'KMS key to encrypt Auth0 secret',
          KeyPolicy: {
            Version: '2012-10-17',
            Id: 'key-default-1',
            Statement: [
              {
                Sid: 'Allow admnistration of the key',
                Effect: 'Allow',
                Principal: {
                  AWS: {
                    'Fn::Join': [
                      ':',
                      [
                        'arn:aws:iam:', 
                        { Ref: 'AWS::AccountId' },
                        'root'
                      ]
                    ]
                  }
                },
                Action: [
                  'kms:*'
                ],
                Resource: '*'
              }
            ]
          }
        }
      },
      KMSKeyAlias: {
        Type: 'AWS::KMS::Alias',
        Properties: {
          AliasName: 'alias/auth0Key-${self:provider.stage}',
          TargetKeyId: { Ref : 'KMSKey' }
        }
      },
      Auth0Secret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: '${self:provider.environment.AUTH_0_SECRET_ID}',
          Description: 'Auth0 secret',
          KmsKeyId: { Ref: 'KMSKey' }
        }
      },
      GroupsDynamoDBtable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.GROUPS_TABLE}",
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"
          }]
        }
      },
      ImagesDynamoDBtable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.IMAGES_TABLE}",
          BillingMode: 'PAY_PER_REQUEST',
          StreamSpecification: {
            StreamViewType: 'NEW_IMAGE'
          },
          AttributeDefinitions: [
            {
              AttributeName: "groupId",
              AttributeType: "S",
            }, 
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "timestamp",
              AttributeType: "S",
            }
          ],
          KeySchema: [
            {
              AttributeName: "groupId",
              KeyType: "HASH"
            },
            {
              AttributeName: "timestamp",
              KeyType: "RANGE"
            }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "${self:provider.environment.IMAGES_ID_INDEX}",
              KeySchema: [
                {
                  AttributeName: 'id',
                  KeyType: 'HASH'
                }
              ],
              Projection: {
                ProjectionType: 'ALL'
              }
            }
          ]
        }
      },
      WebSocketConectionsDynamoDBtable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.CONNECTIONS_TABLE}",
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ]
        }
      },
      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        DependsOn: ['SNSTopicPolicy'],
        Properties: {
          BucketName: '${self:provider.environment.IMAGES_S3_BUCKET}',
          NotificationConfiguration: {
            TopicConfigurations: [
              {
                Event: "s3:ObjectCreated:Put",
                Topic: {
                  "Ref":"ImagesTopic"
                }
              }
            ]
          },
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                MaxAge: 3000
              }
            ]
          }
        }
      },
      BucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          PolicyDocument: {
            Id: "MyPolicy",
            Version: "2012-10-17",
            Statement: [
              {
                Sid: 'PublicReadForGetBucketObjects',
                Effect: 'Allow',
                Principal: '*',
                Action: 's3:GetObject',
                Resource: 'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*'
              }
            ]
          },
          Bucket: '${self:provider.environment.IMAGES_S3_BUCKET}'
        }
      },
      SNSTopicPolicy: {
        Type: "AWS::SNS::TopicPolicy",
        Properties: {
          PolicyDocument: {
            Id: "MyTopicPolicy",
            Version: "2012-10-17",
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS : '*'
                },
                Action: 'sns:Publish',
                Resource: {
                  "Ref":"ImagesTopic"
                },
                Condition: {
                  ArnLike: {
                    'AWS:SourceArn' : 'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}'
                  }
                }
              }
            ]
          },
          Topics: [
            { 'Ref' : 'ImagesTopic' }
          ]
        }
      },
      ThumbnailsBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.THUMBNAILS_S3_BUCKET}'
        }
      },
      ImagesTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          DisplayName: 'Image bucket topic',
          TopicName: '${self:custom.topicName}'
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
