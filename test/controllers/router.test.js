/* eslint-disable jest/no-try-expect */

const generateTemplate = require('../../controllers/generate-template')
const generateImage = require('../../controllers/generate-image')
const formattedLog = require('../../lib/formatted-log')
const router = require('../../controllers/router')

jest.mock('../../controllers/generate-template')
jest.mock('../../controllers/generate-image')
jest.mock('../../lib/formatted-log')

generateTemplate.mockImplementation(url =>
  Promise.resolve({
    contentType: 'text/html',
    data: 'Template ' + url
  })
)

generateImage.mockImplementation(url =>
  Promise.resolve({
    contentType: 'image/png',
    data: 'Image ' + url
  })
)

formattedLog.mockImplementation(error => error)

afterAll(() => {
  jest.resetAllMocks()
})

const HEALTHZ_URL = '/healthz'
const TEMPLATE_URL = '?type=calculator&values=1,2'
const IMAGE_URL = '/image?type=calculator&values=1,2'
const TEST_TEMPLATE_URL = '/test'
const TEST_IMAGE_URL = '/test-image'
const WRONG_URL = '/wrong'
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

it('returns template', async () => {
  let result = await router(requestify(TEMPLATE_URL))

  expect(result).toEqual({
    contentType: 'text/html',
    data: 'Template http://127.0.0.1/?type=calculator&values=1,2'
  })
})

it('returns image', async () => {
  let result = await router(requestify(IMAGE_URL))

  expect(result).toEqual({
    contentType: 'image/png',
    data: 'Image http://127.0.0.1/image?type=calculator&values=1,2'
  })
})

it('returns test template', async () => {
  let result = await router(requestify(TEST_TEMPLATE_URL))

  expect(result).toEqual({
    contentType: 'text/html',
    data:
      'Template https://og-generator.amplifr.com/?type=calculator&values=1,2'
  })
})

it('returns test image', async () => {
  let result = await router(requestify(TEST_IMAGE_URL))

  expect(result).toEqual({
    contentType: 'image/png',
    data:
      'Image https://og-generator.amplifr.com/image?type=calculator&values=1,2'
  })
})

it('returns 404 if path is not found', async () => {
  try {
    await router(requestify(WRONG_URL))
  } catch (error) {
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Action not found: /wrong')
    expect(formattedLog).toBeCalledWith('Action not found', '/wrong', 'error')
  }
})

it('returns 404 if method is not GET', async () => {
  try {
    await router({
      headers: {
        host: '127.0.0.1'
      },
      method: 'POST',
      url: '/wrong'
    })
  } catch (error) {
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Action not found: /wrong')
    expect(formattedLog).toBeCalledWith('Action not found', '/wrong', 'error')
  }
})

it('returns healthz info', async () => {
  let result = await router(requestify(HEALTHZ_URL))

  expect(result).toBe('{"ok":true}')
})

it('returns correct answer for /healthz', async () => {
  let result = await router(requestify(OK_URL))
  expect(result).toBe('{"ok":true}')
})
