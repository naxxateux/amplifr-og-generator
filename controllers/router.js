const generateTemplate = require('../controllers/generate-template')
const generateImage = require('../controllers/generate-image')
const formattedLog = require('../lib/formatted-log')

const TEST_IMAGE_URL =
  'https://og-generator.amplifr.com/image?type=calculator&values=1,2'
const TEST_URL = 'https://og-generator.amplifr.com?type=calculator&values=1,2'

function response404 (requestUrl) {
  formattedLog('Action not found', requestUrl, 'error')

  let e = new Error(`Action not found: ${requestUrl}`)

  e.statusCode = 404

  throw e
}

function router (request) {
  let baseUrl = 'http://' + request.headers.host + '/'
  let parsedUrl = new URL(request.url, baseUrl)
  let queryType = parsedUrl.searchParams.get('type')

  if (parsedUrl.pathname === '/healthz') {
    return JSON.stringify({ ok: true })
  }

  if (request.method !== 'GET') {
    return response404(request.url)
  } else if (parsedUrl.pathname === '/image' && queryType) {
    return generateImage(parsedUrl)
  } else if (parsedUrl.pathname === '/' && queryType) {
    return generateTemplate(parsedUrl)
  } else if (parsedUrl.pathname === '/test-image') {
    return generateImage(new URL(TEST_IMAGE_URL))
  } else if (parsedUrl.pathname === '/test') {
    return generateTemplate(new URL(TEST_URL))
  } else {
    return response404(request.url)
  }
}

module.exports = router
