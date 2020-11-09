module.exports = function escape (str) {
  return (
    str
      .replace(/\n/gm, ' ')
      // remove non-breaking spaces
      // eslint-disable-next-line no-irregular-whitespace
      .replace(/ /g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&laquo;/g, '«')
      .replace(/&raquo;/g, '»')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .replace(/&hellip;/g, '…')
      .replace(/\s+/g, ' ')
      .trim()
  )
}
