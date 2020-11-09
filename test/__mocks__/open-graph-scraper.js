const SUCCESS_FORCED = 'http://success.com/?amplifr=12345'
const NO_IMAGE_URL = 'http://no-image-url.com'
const FEW_IMAGES = 'http://few-images.com'
const SUCCESS = 'http://success.com'
const NO_HTTP = 'http://yaffi.com'
const EMPTY = 'http://empty.com'
const ERROR = 'http://error.com'
const TRIM = 'http://trim.com'

class OpenGraphScraperError extends Error {
  constructor (message) {
    super(message)
    this.name = 'OpenGraphScraperError'
    this.result = {
      error: 'Quack!'
    }
  }
}

function openGraphScraper (options) {
  let page = options.url
  if (page === SUCCESS || page === SUCCESS_FORCED) {
    return Promise.resolve({
      result: {
        ogDescription: 'Yaffi is a cute italian greyhound dog',
        uselessKeys: 'should be filtered',
        ogImage: {
          url: 'http://success.com/absolute.png',
          width: null,
          height: null,
          type: null
        },
        ogTitle: 'Yaffi The Sunshine',
        ogUrl: 'http://success.com'
      }
    })
  } else if (page === TRIM) {
    return Promise.resolve({
      result: {
        uselessKeys: 'should be filtered',
        ogDescription:
          'The paradox of tolerance states that if a society is tolerant ' +
          'without limit, its ability to be tolerant is eventually seized ' +
          'or destroyed by the intolerant. Karl Popper described it as ' +
          'the seemingly paradoxical idea that, "In order to maintain ' +
          'a tolerant society, the society must be intolerant of intolerance."',
        ogImage: {
          url: './relative.png',
          width: 100,
          height: 300,
          type: 'png'
        },
        ogTitle: 'The    paradox of\ntolerance',
        ogUrl: 'http://trim.com'
      }
    })
  } else if (page === NO_HTTP) {
    return Promise.resolve({
      result: {
        ogDescription: 'Yaffi &mdash; the cutest italian greyhound dog&hellip;',
        uselessKeys: 'should be filtered',
        ogTitle: 'Yaffi The Sunshine',
        ogUrl: 'http://yaffi.com'
      }
    })
  } else if (page === NO_IMAGE_URL) {
    return Promise.resolve({
      result: {
        ogDescription: 'Yaffi',
        ogImage: {
          width: null,
          height: null,
          type: null
        },
        ogTitle: 'Yaffi',
        ogUrl: 'http://no-image-url.com'
      }
    })
  } else if (page === FEW_IMAGES) {
    return Promise.resolve({
      result: {
        ogDescription: 'Yaffi',
        ogImage: [
          {
            url: 'http://first-image.com/image.png',
            width: 1250,
            height: 350,
            type: 'png'
          },
          {
            url: 'http://second-image.com/image.png',
            width: null,
            height: null,
            type: null
          }
        ],
        ogTitle: 'Yaffi',
        ogUrl: 'http://no-image-url.com'
      }
    })
  } else if (page === EMPTY) {
    return Promise.resolve({
      result: {}
    })
  } else if (page === ERROR) {
    return Promise.reject(new OpenGraphScraperError())
  } else {
    return Promise.reject(new Error('Oops!'))
  }
}

module.exports = openGraphScraper
