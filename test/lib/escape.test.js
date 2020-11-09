const escape = require('../../lib/escape')

const INPUT =
  'The&nbsp;quick brown fox &laquo;Cerdocyon&raquo; &mdash; ' +
  'a canid with a long bushy tail &mdash; jumps over ' +
  'the lazy Yaffi 2&ndash;3 times&hellip;'
const OUTPUT =
  'The quick brown fox «Cerdocyon» — a canid with a long ' +
  'bushy tail — jumps over the lazy Yaffi 2–3 times…'

it('replaces HTML codes with UTF symbols', () => {
  expect(escape(INPUT)).toBe(OUTPUT)
})
