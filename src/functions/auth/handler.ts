import { CustomAuthorizerEvent, APIGatewayAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { verifyToken } from './../../services/JwtTokenService';
import { JwtToken } from '../../models/JwtToken';


const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD


export const rs256Auth0Authorizer = async (event: APIGatewayAuthorizerEvent): Promise<CustomAuthorizerResult> =>  {
    try {
        const jwtToken = verifyToken(event.authorizationToken)
        console.log('User was authorized', jwtToken)
    
        return {
          principalId: jwtToken.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: '*'
              }
            ]
          }
        }
      } catch (e) {
        console.log('User authorized', e.message)
    
        return {
          principalId: 'user',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Deny',
                Resource: '*'
              }
            ]
          }
        }
    }
}


export const auth0Authorizer = middyfy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
    try {
      const decodedToken = verifyToken(
        event.authorizationToken,
        context.AUTH0_SECRET[secretField]
      )
      console.log('User was authorized', decodedToken)
  
      return {
        principalId: decodedToken.sub,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: '*'
            }
          ]
        }
      }
    } catch (e) {
      console.log('User was not authorized', e.message)
  
      return {
        principalId: 'user',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Deny',
              Resource: '*'
            }
          ]
        }
      }
    }
  })


  