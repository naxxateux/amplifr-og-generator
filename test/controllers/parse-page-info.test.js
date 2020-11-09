const parsePageInfo = require('../../controllers/parse-page-info')
const formattedLog = require('../../lib/formatted-log')
const report = require('../../lib/report')

jest.mock('../../lib/report')
jest.mock('../../lib/formatted-log')
formattedLog.mockImplementation(error => error)
report.mockImplementation(() => {})

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(Date, 'now').mockImplementation(() => 12345)
})

const NO_IMAGE_URL = 'http://no-image-url.com'
const FEW_IMAGES = 'http://few-images.com'
const SUCCESS = 'http://success.com'
const NO_HTTP = 'yaffi.com'
const EMPTY = 'http://empty.com'
const ERROR = 'http://error.com'
const TRIM = 'http://trim.com'
const CYR = 'чоч.рф'

function requestify (url) {
  return new URL(url, 'http://127.0.0.1')
}

it(
  'returns info from Scraper ' +
    'filters useless keys and images, adds images and source keys,',
  async () => {
    let result = await parsePageInfo(requestify('?url=' + SUCCESS))

    expect(result).toEqual({
      data: JSON.stringify({
        description: 'Yaffi is a cute italian greyhound dog',
        title: 'Yaffi The Sunshine',
        image: {
          url: 'http://success.com/absolute.png',
          width: null,
          height: null,
          type: null
        },
        url: 'http://success.com'
      })
    })
  }
)

it('returns the same info from Scraper if request is forced', async () => {
  let result = await parsePageInfo(
    requestify('?url=' + SUCCESS + '&isForced=true')
  )

  expect(result).toEqual({
    data: JSON.stringify({
      description: 'Yaffi is a cute italian greyhound dog',
      title: 'Yaffi The Sunshine',
      image: {
        url: 'http://success.com/absolute.png',
        width: null,
        height: null,
        type: null
      },
      url: 'http://success.com'
    })
  })
})

it(
  'trims and escapes description and title correctly and ' +
    'replaces relative urls with absolute ones',
  async () => {
    let result = await parsePageInfo(requestify('?url=' + TRIM))

    expect(result).toEqual({
      data: JSON.stringify({
        description:
          'The paradox of tolerance states that if a society is tolerant ' +
          'without limit, its ability to be tolerant is eventually seized ' +
          'or destroyed by the intolerant. Karl Po…',
        title: 'The paradox of tolerance',
        image: {
          url: 'http://trim.com/relative.png',
          width: 100,
          height: 300,
          type: 'png'
        },
        url: 'http://trim.com'
      })
    })
  }
)

it('sets default title and description if there are no one', async () => {
  let result = await parsePageInfo(requestify('?url=' + EMPTY))

  expect(result).toEqual({
    data: JSON.stringify({
      description: '',
      image: undefined,
      title: '',
      url: 'http://empty.com'
    })
  })
})

it(
  'sets default title and description if there are no one ' +
    'with fallback disabled',
  async () => {
    let result = await parsePageInfo(
      requestify('?isWithoutFallback=true&url=' + EMPTY)
    )

    expect(result).toEqual({
      data: JSON.stringify({
        description: '',
        image: undefined,
        title: '',
        url: 'http://empty.com'
      })
    })
  }
)

it('removes incorrect image', async () => {
  let result = await parsePageInfo(requestify('?url=' + NO_IMAGE_URL))

  expect(result).toEqual({
    data: JSON.stringify({
      description: 'Yaffi',
      image: undefined,
      title: 'Yaffi',
      url: 'http://no-image-url.com'
    })
  })
})

it('gets first image if got image array', async () => {
  let result = await parsePageInfo(requestify('?url=' + FEW_IMAGES))

  expect(result).toEqual({
    data: JSON.stringify({
      description: 'Yaffi',
      title: 'Yaffi',
      image: {
        url: 'http://first-image.com/image.png',
        width: 1250,
        height: 350,
        type: 'png'
      },
      url: 'http://few-images.com'
    })
  })
})

it('add http if url doesn’t contain it', async () => {
  let result = await parsePageInfo(requestify('?url=' + NO_HTTP))

  expect(result).toEqual({
    data: JSON.stringify({
      description: 'Yaffi — the cutest italian greyhound dog…',
      image: undefined,
      title: 'Yaffi The Sunshine',
      url: 'http://yaffi.com'
    })
  })
})

it('returns an error message if Scraper returned error', async () => {
  let data = parsePageInfo(requestify('?url=' + ERROR))

  await expect(data).rejects.toThrow('Quack! http://error.com')
  await expect(data).rejects.toHaveProperty('statusCode', 400)

  expect(report).toBeCalled()
})

it('filters Cyrillic letters in statusMessage', async () => {
  let data = parsePageInfo(requestify('?url=' + CYR))

  await expect(data).rejects.toThrow('Unknown error .')
  await expect(data).rejects.toHaveProperty('statusCode', 400)
  expect(report).toBeCalled()
})
