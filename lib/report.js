const Sentry = require('@sentry/node')

const formattedLog = require('./formatted-log')

const DEBUG = false

Sentry.init({
  dsn: 'https://3f2b86b925b34669ad94e543cb3cedce@sentry.io/1434908'
})

function report (error, extra, level = 'error') {
  formattedLog(error, extra, level)

  if ((DEBUG && level === 'error') || level === 'info') {
    Sentry.withScope(scope => {
      for (let e in extra) {
        scope.setExtra(e, extra[e])
      }
      Sentry.captureException(error)
    })
  }
}

module.exports = report
