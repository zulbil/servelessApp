import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import secretsManager from '@middy/secrets-manager';
import { cors } from "middy/middlewares";

const secretId = process.env.AUTH_0_SECRET_ID

export const middyfy = (handler) => {
  return middy(handler)
  .use(middyJsonBodyParser())
  .use(
    secretsManager({
      cache: true,
      cacheExpiryInMillis: 60000,
      // Throw an error if can't read the secret
      throwOnFailedCall: true,
      secrets: {
        AUTH0_SECRET: secretId
      }
    })
  )
  .use(
    cors({
      credentials: true
    })
  )
}
