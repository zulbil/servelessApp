import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
// import middy from '@middy/core'
import { middyfy } from '@libs/lambda';
// import secretsManager from '@middy/secrets-manager';
import { jwtTokenService } from './../../services';


// const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD


export const rs256Auth0Authorizer = middyfy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> =>  {
    try {
        const jwtToken = jwtTokenService.verifyToken(event.authorizationToken)
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
})


export const auth0Authorizer = middyfy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
    try {
      const decodedToken = jwtTokenService.verifyToken(
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

// auth0Authorizer.use(
//   secretsManager({
//     cache: true,
//     cacheExpiryInMillis: 60000,
//     // Throw an error if can't read the secret
//     throwOnFailedCall: true,
//     secrets: {
//       AUTH0_SECRET: secretId
//     }
//   })
// )
  