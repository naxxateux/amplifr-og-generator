const fastimage = require('fastimage')

const formattedLog = require('../lib/formatted-log')
const report = require('../lib/report')

async function imageInfo (image) {
  if (image.width && image.height && image.type) {
    return Promise.resolve(image)
  }

  let info = await fastimage.info(image.url)

  return {
    height: info.height,
    width: info.width,
    type: info.type,
    url: image.url
  }
}

async function parseImageInfo (requestUrl) {
  let image = { url: requestUrl.searchParams.get('url') }

  try {
    let newImage = await imageInfo(image)

    formattedLog('Image Info sent to client', newImage)

    return {
      data: JSON.stringify(newImage)
    }
  } catch (error) {
    report(error, { fullUrl: requestUrl, url: image }, 'warn')

    let e = new Error(`Error: ${JSON.stringify(error)}`)

    e.statusCode = 500

    throw e
  }
}

module.exports = parseImageInfo
