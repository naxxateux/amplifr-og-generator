const http = require('http')

const formattedLog = require('./lib/formatted-log')
const router = require('./controllers/router')

const INTERNAL_PORT = process.env.INTERNAL_PORT || '8081'
const PORT = process.env.PORT || '8080'
const HOST = process.env.HOST || '0.0.0.0'

formattedLog('Starting server…')
http.createServer(onRequest).listen(PORT, HOST)
http.createServer(onRequest).listen(INTERNAL_PORT, HOST)
formattedLog('Server is listening', `http://${HOST}:${PORT}`)
formattedLog('Internal Server is listening', `http://${HOST}:${INTERNAL_PORT}`)

async function onRequest (request, response) {
  formattedLog('Started request processing', `${request.method} ${request.url}`)

  try {
    let result = await router(request)
    let contentType = result.contentType || 'application/json; charset=utf-8'

    response.setHeader('Content-Type', contentType)

    return response.end(result.data)
  } catch (error) {
    response.statusMessage = error.message
    response.statusCode = error.statusCode || 500

    return response.end()
  }
}

function reactToSignals () {
  process.on('SIGINT', () => {
    formattedLog('SIGINT received. Stopping server…')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    formattedLog('SIGTERM received. Stopping server…')
    process.exit(0)
  })

  process.on('exit', () => {
    formattedLog('Server stopped')
  })
}

reactToSignals()
