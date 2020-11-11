const { readFile } = require('fs').promises
const { parse } = require('node-html-parser')

const formattedLog = require('../lib/formatted-log')

const TEMPLATE_PARAMS = {
  calculator: {
    title: values => {
      let [h, r] = values.split(',')

      return `Я узнал, что смогу сэкономить на соцсетях ${h} и ${r}`
    },
    image: values =>
      `https://og-generator.amplifr.com/image?type=calculator&values=${values}`
  }
}

function addUserDataToTemplate (template, type, values) {
  if (!values) return template

  let root = parse(template)
  let head = root.querySelector('head')
  let body = root.querySelector('body')
  let templateParams = TEMPLATE_PARAMS[type]

  head.appendChild(
    `<meta property="og:title" content="${templateParams.title(values)}">`
  )

  head.appendChild(
    `<meta property="og:image" content="${templateParams.image(values)}">`
  )

  head.appendChild(
    `<meta name="twitter:title" content="${templateParams.title(values)}">`
  )

  head.appendChild(
    `<meta name="twitter:image" content="${templateParams.title(values)}">`
  )

  body.appendChild(`<title>${templateParams.title(values)}</title>`)

  return root.toString()
}

async function generateTemplate (requestUrl) {
  let type = requestUrl.searchParams.get('type')
  let values = requestUrl.searchParams.get('values')

  try {
    let template = await readFile(`./templates/${type}.html`)

    formattedLog('Template sent to client', type)

    return {
      contentType: 'text/html',
      data: addUserDataToTemplate(template, type, values)
    }
  } catch {
    formattedLog('Template not found', type)

    let e = new Error(`Template not found: ${type}`)

    e.statusCode = 404

    throw e
  }
}

module.exports = generateTemplate
