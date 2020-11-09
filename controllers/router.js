const { getMonitoring } = require('../lib/prometheus')
const parseImageInfo = require('./parse-image-info')
const parsePageInfo = require('./parse-page-info')
const formattedLog = require('../lib/formatted-log')

const INTERNAL_PORT = process.env.INTERNAL_PORT || '8081'
const TEST_URL = 'https://preview.amplifr.com?url=https://amplifr.com'

function response404 (requestUrl) {
  formattedLog('Action not found', requestUrl, 'error')
  let e = new Error(`Action not found: ${requestUrl}`)

  e.statusCode = 404

  throw e
}

function router (request) {
  let baseUrl = 'http://' + request.headers.host + '/'
  let parsedUrl = new URL(request.url, baseUrl)
  let isInternal = parsedUrl.port === INTERNAL_PORT
  let queryUrl = parsedUrl.searchParams.get('url')

  if (parsedUrl.pathname === '/healthz') {
    return JSON.stringify({ ok: true })
  } else if (parsedUrl.pathname === '/metrics' && isInternal) {
    return getMonitoring()
  }

  if (request.method !== 'GET') {
    return response404(request.url)
  } else if (parsedUrl.pathname === '/image/info') {
    return parseImageInfo(parsedUrl)
  } else if (parsedUrl.pathname === '/' && queryUrl) {
    return parsePageInfo(parsedUrl, request.headers.referer)
  } else if (parsedUrl.pathname === '/test') {
    return parsePageInfo(new URL(TEST_URL))
  } else {
    return response404(request.url)
  }
}

module.exports = router
