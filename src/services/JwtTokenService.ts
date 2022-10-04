import { decode, verify } from 'jsonwebtoken'
import { JwtToken } from '../models/JwtToken';

const cert = '';

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function getUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtToken
    return decodedJwt.sub
}


export function verifyToken(authHeader: string): JwtToken {
    if (!authHeader)
      throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
  
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}