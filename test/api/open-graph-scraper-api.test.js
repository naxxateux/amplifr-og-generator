const openGraphScraper = jest.requireActual('open-graph-scraper')

async function askScraper (page) {
  let options = {
    url: page,
    headers: {
      'user-agent':
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    },
    timeout: 10000,
    ogImageFallback: false,
    onlyGetOpenGraphInfo: false
  }

  return openGraphScraper(options)
}

it('checks response format from Open Graph Scraper', async () => {
  let result = await askScraper('https://amplifr.com')
  expect(result.result).toMatchSnapshot()
})
