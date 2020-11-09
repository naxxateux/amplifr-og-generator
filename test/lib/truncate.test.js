const truncate = require('../../lib/truncate')

const PLAIN = 'The quick brown fox jumps over the lazy Yaffi'
const SHORT = 'Yaffi The Sunshine'

it('doesn’t truncate short texts', () => {
  expect(truncate(SHORT, 31)).toBe('Yaffi The Sunshine')
})

it('truncates plain text', () => {
  expect(truncate(PLAIN, 31)).toBe('The quick brown fox jumps over…')
})
