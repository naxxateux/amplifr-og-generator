const CYR = /[А-ЯЁЂЃЄЅІЇЈЉЊЋЌЎЏҐа-яёђѓєѕіїјљњћќўџґ]/g

function cyrillicEscape (text) {
  if (!text) return ''

  return text.replace(CYR, '')
}

module.exports = cyrillicEscape
