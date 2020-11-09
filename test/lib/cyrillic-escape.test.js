const cyrillicEscape = require('../../lib/cyrillic-escape')

const ERROR = 'Not found: http://чоч.рф'
const SHORT = 'Яффи'

it('escapes Cyrillic letters in message', () => {
  expect(cyrillicEscape(ERROR)).toBe('Not found: http://.')
  expect(cyrillicEscape(SHORT)).toBe('')
})

it('works with undefined message', () => {
  expect(cyrillicEscape()).toBe('')
})
