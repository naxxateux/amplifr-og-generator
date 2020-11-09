const openGraphScraper = require('open-graph-scraper')

const { registerEvent } = require('../lib/prometheus')
const cyrillicEscape = require('../lib/cyrillic-escape')
const formattedLog = require('../lib/formatted-log')
const truncate = require('../lib/truncate')
const escape = require('../lib/escape')
const report = require('../lib/report')

const HEADERS = {
  'user-agent':
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
}

async function askScraper (url, isWithoutFallback) {
  let options = {
    onlyGetOpenGraphInfo: isWithoutFallback,
    ogImageFallback: false,
    headers: HEADERS,
    timeout: 10000,
    url
  }

  if (url.includes('cookpad.com')) delete options.headers

  let scrapped = await openGraphScraper(options)

  let { ogDescription, ogImage, ogTitle, ogUrl } = scrapped.result

  return {
    ogDescription,
    ogImage,
    ogTitle,
    ogUrl
  }
}

function processData ({ isWithoutFallback, data, url }) {
  let description = data.ogDescription || ''
  let title = data.ogTitle || ''

  if (!isWithoutFallback) {
    description = truncate(description, 165)
    title = truncate(title, 88)
  }

  let output = {
    description: escape(description),
    image: Array.isArray(data.ogImage) ? data.ogImage[0] : data.ogImage,
    title: escape(title),
    url
  }

  if (!output.image?.url) output.image = undefined

  if (output.image?.url[0] === '.' || output.image?.url[0] === '/') {
    let absoluteUrl = new URL(output.image.url, url)
    output.image.url = absoluteUrl.toString()
  }

  formattedLog('Data sent back to client', output)

  return JSON.stringify(output)
}

async function parsePageInfo (requestUrl, referer) {
  let isWithoutFallback = !!requestUrl.searchParams.get('isWithoutFallback')
  let originalUrl = requestUrl.searchParams.get('url')
  let isForced = !!requestUrl.searchParams.get('isForced')
  let url

  if (!originalUrl.startsWith('http')) {
    url = `http://${originalUrl}`
  } else {
    url = originalUrl
  }

  registerEvent({ isWithoutFallback, isForced, referer, type: 'parsePageInfo' })

  try {
    let data = await askScraper(url, isWithoutFallback)

    data = processData({ isWithoutFallback, data, url })

    registerEvent({
      isWithoutFallback,
      isForced,
      referer,
      type: 'parsePageInfoSuccess'
    })

    return { data }
  } catch (data) {
    let errorDetails = data.result?.errorDetails
    let message = data.result?.error || 'Unknown error'

    registerEvent({ error: message, referer, type: 'scraperError', url })
    report(message, errorDetails, 'warn')

    let e = new Error(`${message} ${cyrillicEscape(originalUrl)}`)

    e.statusCode = 400

    throw e
  }
}

module.exports = parsePageInfo
