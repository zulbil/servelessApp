import { decode, verify } from 'jsonwebtoken'
import { JwtToken } from '../models/JwtToken';

export default class JwtTokenService {

  private cert: string = `-----BEGIN CERTIFICATE-----
  MIIDDTCCAfWgAwIBAgIJei72PtktgeIgMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
  BAMTGWRldi1wcWlqZnktaS51cy5hdXRoMC5jb20wHhcNMjIwODA5MTYwMTI4WhcN
  MzYwNDE3MTYwMTI4WjAkMSIwIAYDVQQDExlkZXYtcHFpamZ5LWkudXMuYXV0aDAu
  Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsSjRxkPkppQohSRe
  wdJU3KNSheTUTct21hthHrnKcZzLR72OojoTtuNJEfpzHJXhN8+y1scWacOoQijE
  bQGx+kwxNmGhqY9w+ygsKaWZZ6FNog1EQpD6mK9mloqu8qPxxidWmdHESy/HNMZI
  bt3bm0CHVpOKnoQMoopHoEYwl0D5kKUBESdJcMvhcBOBkqT7bLjKmTYv5S14sFW5
  zIEO0/O+Bh2uTxg5yeiIJy5FwjyRQQvibwCzRyZlEVcQm8Z5vCe4fIcvB/7THxT/
  dyNKOnud65h5B3dnuYudoVZwdDLDfzYpYtAcLLaai7FLID8jRbdJu9046kcILw2M
  mN7mPQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR1EnUjByrr
  tGDLkSA6z9LfKBng7TAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
  AKoFteef8OlXMaKBzb9SUh8DBpYCVMko/nNgxgddcp0jpC63rwjiCO6FkXw51YAv
  jfDDglfgVTBQd0FryIgAWOtEQuL+VAAnrA3uy7weI6jWyCO3hgAy6Pqgt6S7FnYI
  T7B+TcnwkBU5gnv8Pwh9Eo1fyt353Fw3hFEK8wK1C01gMwIu+hCLs29SdQb6pJzb
  vq8B6ZQrQp1MyBOd5tpRJgVB3yq+Rbp8jsx9JSsDQ3PGQbJVixAE/d39tcLXzEIu
  Up7rf8ZD+Ow29q+ZBFi8Q7ipiJemg8MiwQ6J40Z/y3FFgZHxyHLP7yklhsqOXqwd
  VXD48h/jn/W/+P+I+2ozNig=
  -----END CERTIFICATE-----`;

  /**
   * Parse a JWT token and return a user id
   * @param jwtToken JWT token to parse
   * @returns a user id from the JWT token
   */
  getUserId(jwtToken: string): string {
      const decodedJwt = decode(jwtToken) as JwtToken
      return decodedJwt.sub
  }


  verifyToken(authHeader: string, secret: string = null): JwtToken {
    if (secret) {
      return this.verifyTokenHS256(authHeader, secret);
    }
    return this.verifyTokenRS256(authHeader);
  }

  verifyTokenRS256(authHeader: string): JwtToken {
      if (!authHeader)
        throw new Error('No authentication header')
    
      if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')
    
      const split = authHeader.split(' ')
      const token = split[1]
    
      return verify(token, this.cert, { algorithms: ['RS256'] }) as JwtToken
  }

  verifyTokenHS256(authHeader: string, secret: string): JwtToken {
    if (!authHeader)
      throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return verify(token, secret) as JwtToken
  }

}