import type { AWS } from '@serverless/typescript';

import {getGroups, createGroup, getGroup, updateGroup, deleteGroup } from '@functions/groups';
import { getImagesByGroup, getImage, createImage } from '@functions/images';
import { sendUploadNotifications } from '@functions/s3';

const serverlessConfiguration: AWS = {
  service: 'servelessapp',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
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
      APP_NAME: 'servelessapp'
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
    sendUploadNotifications
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
    }
  },
  resources: {
    Resources: {
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
        Properties: {
          BucketName: '${self:provider.environment.IMAGES_S3_BUCKET}',
          NotificationConfiguration: {
            LambdaConfigurations: [
              {
                Event: "s3:ObjectCreated:*",
                Function: "${self:provider.environment.APP_NAME}-${self:provider.stage}-sendUploadNotifications"
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
      SendUploadNotificationsPermission: {
        Type: "AWS::Lambda::Permission",
        Properties: {
          FunctionName: '${self:provider.environment.APP_NAME}-${self:provider.stage}-sendUploadNotifications',
          Principal: 's3.amazonaws.com',
          Action: 'lambda:InvokeFunction',
          SourceAccount: { 'Ref' : 'AWS::AccountId'},
          SourceArn: "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}"
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
