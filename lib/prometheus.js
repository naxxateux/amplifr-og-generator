let prometheus = require('prom-client')

let scraperErrorsCount
let requestsCount
let successCount
let registry

function startMonitoring () {
  registry = new prometheus.Registry()

  prometheus.collectDefaultMetrics({ register: registry })

  requestsCount = new prometheus.Counter({
    name: 'preview_urls_counter',
    help: 'How many requests were processed',
    labelNames: ['is_without_fallback', 'is_forced', 'referer'],
    registers: [registry]
  })

  successCount = new prometheus.Counter({
    name: 'preview_urls_counter_success',
    help: 'How many requests were successfull',
    labelNames: ['is_without_fallback', 'is_forced', 'referer'],
    registers: [registry]
  })

  scraperErrorsCount = new prometheus.Counter({
    name: 'preview_scraper_errors_counter',
    help: 'How many requests returned OG scraper error',
    labelNames: ['referer', 'error', 'url'],
    registers: [registry]
  })
}

function registerEvent (event) {
  if (!registry) return

  if (event.type === 'parsePageInfo') {
    requestsCount.inc({
      is_without_fallback: event.isWithoutFallback,
      is_forced: event.isForced,
      referer: event.referer
    })
  } else if (event.type === 'parsePageInfoSuccess') {
    successCount.inc({
      is_without_fallback: event.isWithoutFallback,
      is_forced: event.isForced,
      referer: event.referer
    })
  } else if (event.type === 'scraperError') {
    scraperErrorsCount.inc({
      referer: event.referer,
      error: event.error,
      url: event.url
    })
  }
}

function getMonitoring () {
  return {
    contentType: registry.contentType,
    data: registry.metrics()
  }
}

module.exports = {
  startMonitoring,
  getMonitoring,
  registerEvent
}
