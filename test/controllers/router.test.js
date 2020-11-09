/* eslint-disable jest/no-try-expect */

const parseImageInfo = require('../../controllers/parse-image-info')
const parsePageInfo = require('../../controllers/parse-page-info')
const formattedLog = require('../../lib/formatted-log')
const prometheus = require('../../lib/prometheus')
const router = require('../../controllers/router')

jest.mock('../../controllers/parse-image-info')
jest.mock('../../controllers/parse-page-info')
jest.mock('../../lib/formatted-log')
jest.mock('../../lib/prometheus')

parseImageInfo.mockImplementation(url =>
  Promise.resolve({
    data: 'Image ' + url
  })
)
parsePageInfo.mockImplementation(url =>
  Promise.resolve({
    data: 'Page ' + url
  })
)
formattedLog.mockImplementation(error => error)

afterAll(() => {
  jest.resetAllMocks()
})

const INTERNAL_PROMETHEUS_URL = 'http://127.0.0.1:8081/metrics'
const PROMETHEUS_URL = 'http://127.0.0.1:8080/metrics'
const HEALTHZ_URL = '/healthz'
const IMAGE_URL = '/image/info?url=http://amplifr.com/yaffi.jpg'
const WRONG_URL = '/h4ck'
const PAGE_URL = '/?url=http://amplifr.com/'
const TEST_URL = '/test'
const OK_URL = '/healthz'

function requestify (url) {
  return {
    headers: {
      referer: 'https://amplifr.com/',
      host: '127.0.0.1'
    },
    method: 'GET',
    url
  }
}

it('returns image info', async () => {
  let result = await router(requestify(IMAGE_URL))

  expect(result).toEqual({
    data: 'Image http://127.0.0.1/image/info?url=http://amplifr.com/yaffi.jpg'
  })
})

it('returns page info', async () => {
  let result = await router(requestify(PAGE_URL))

  expect(result).toEqual({
    data: 'Page http://127.0.0.1/?url=http://amplifr.com/'
  })
})

it('returns test info', async () => {
  let result = await router(requestify(TEST_URL))

  expect(result).toEqual({
    data: 'Page https://preview.amplifr.com/?url=https://amplifr.com'
  })
})

it('returns 404 if path is not found', async () => {
  try {
    await router(requestify(WRONG_URL))
  } catch (error) {
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Action not found: /h4ck')
    expect(formattedLog).toBeCalledWith('Action not found', '/h4ck', 'error')
  }
})

it('returns 404 if method is not GET', async () => {
  try {
    await router({
      headers: {
        host: '127.0.0.1'
      },
      method: 'POST',
      url: '/h4ck'
    })
  } catch (error) {
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Action not found: /h4ck')
    expect(formattedLog).toBeCalledWith('Action not found', '/h4ck', 'error')
  }
})

it('returns healthz info', async () => {
  let result = await router(requestify(HEALTHZ_URL))

  expect(result).toBe('{"ok":true}')
})

it('returns monitoring info on internal port only', async () => {
  jest.spyOn(prometheus, 'getMonitoring').mockImplementation(() => {
    return { headers: 'plain/text', data: '{}' }
  })

  let result = await router(requestify(INTERNAL_PROMETHEUS_URL))

  expect(result).toEqual({ headers: 'plain/text', data: '{}' })

  try {
    await router(requestify(PROMETHEUS_URL))
  } catch (error) {
    expect(error.statusCode).toBe(404)
  }
})

it('returns correct answer for /healthz', async () => {
  let result = await router(requestify(OK_URL))
  expect(result).toBe('{"ok":true}')
})
