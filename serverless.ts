import type { AWS } from '@serverless/typescript';

import {getGroups, createGroup, getGroup, updateGroup, deleteGroup } from '@functions/groups';

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
      IMAGES_TABLE: 'Images-${self:provider.stage}'
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
          Resource: "arn:aws:dynamodb:us-east-1:114465344430:table/${self:provider.environment.GROUPS_TABLE}",
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
          Resource: 'arn:aws:dynamodb:us-east-1:114465344430:table/${self:provider.environment.IMAGES_TABLE}'
        }
      ]
      },
    }
  },
  // import the function via paths
  functions: { getGroups, createGroup, getGroup, updateGroup, deleteGroup },
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
          AttributeDefinitions: [{
            AttributeName: "groupId",
            AttributeType: "S",
          }, {
            AttributeName: "timestamp",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "groupId",
            KeyType: "HASH"
          },
          {
            AttributeName: "timestamp",
            KeyType: "RANGE"
          }]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
