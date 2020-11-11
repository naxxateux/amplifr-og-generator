const { createCanvas, registerFont, loadImage } = require('canvas')

const formattedLog = require('../lib/formatted-log')

const IMAGE_PARAMS = {
  calculator: {
    color: '#ffcc30',
    font: '60px "Inter"',
    text: values => {
      let [h, r] = values.split(',')

      return `${h} и ${r}`
    },
    x: 60,
    y: 244
  }
}

registerFont('./fonts/Inter-Bold-slnt=0.ttf', { family: 'Inter' })

async function generateImage (requestUrl) {
  let type = requestUrl.searchParams.get('type')
  let values = requestUrl.searchParams.get('values')

  try {
    let image = await loadImage(`./images/${type}.png`)
    let imageParams = IMAGE_PARAMS[type]
    let canvas = createCanvas(image.width, image.height)
    let context = canvas.getContext('2d')

    context.drawImage(image, 0, 0)
    context.font = imageParams.font
    context.fillStyle = imageParams.color
    context.fillText(imageParams.text(values), imageParams.x, imageParams.y)

    formattedLog('Image sent to client', type)

    return {
      contentType: 'image/png',
      data: canvas.toBuffer()
    }
  } catch {
    formattedLog('Image not found', type)

    let e = new Error(`Image not found: ${type}`)

    e.statusCode = 404

    throw e
  }
}

module.exports = generateImage
