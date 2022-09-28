import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { connectionService } from '../../services'

export const connect: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Websocket connect', event)
  
    const connectionId = event.requestContext.connectionId
    const timestamp = new Date().toISOString()
  
    const item = {
      id: connectionId,
      timestamp
    }
  
    console.log('Storing item: ', item)
  
    connectionService.createConnection(item);
  
    return {
      statusCode: 200,
      body: ''
    }
}

export const disconnect: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Websocket disconnect', event)
  
    const connectionId = event.requestContext.connectionId

    console.log('Removing item with key: ', connectionId)

    connectionService.deleteConnection(connectionId);
  
    return {
      statusCode: 200,
      body: ''
    }
}