import { HttpMethodWithRequestBody, HttpRequestMethod } from '../../Common/Http'

describe('Http', () => {
  it('Should correctly identify methods that are allowed to have request bodies', () => {
    const shouldBeTrue: HttpRequestMethod[] = ['post', 'POST', 'put', 'PUT', 'options', 'OPTIONS']
    const shouldBeFalse: HttpRequestMethod[] = [
      'head',
      'HEAD',
      'get',
      'GET',
      'delete',
      'DELETE',
      'trace',
      'TRACE',
      'connect',
      'CONNECT',
    ]
    for (const method of shouldBeTrue) {
      expect(HttpMethodWithRequestBody(method)).toBe(true)
    }
    for (const method of shouldBeFalse) {
      expect(HttpMethodWithRequestBody(method)).toBe(false)
    }
  })
})
