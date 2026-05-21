import { HSTS_HEADER_VALUE } from '@/config/securityHeaders'
import {
  applyClientSecurityHeaders,
  applySecurityHeaders,
  securityHeaders,
} from '@/utils/securityHeaders'

describe('securityHeaders', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('defines HSTS as a response header', () => {
    expect(securityHeaders['Strict-Transport-Security']).toBe(HSTS_HEADER_VALUE)
  })

  it('does not inject HSTS into client request headers', () => {
    const headers = applySecurityHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    })

    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    })
    expect(headers['Strict-Transport-Security']).toBeUndefined()
  })

  it('adds supported meta tags without trying to create an HSTS meta tag', () => {
    applyClientSecurityHeaders()

    expect(document.querySelector('meta[http-equiv="Content-Security-Policy"]')).toBeTruthy()
    expect(document.querySelector('meta[name="referrer"]')).toBeTruthy()
    expect(document.querySelector('meta[http-equiv="Strict-Transport-Security"]')).toBeNull()
  })
})
