module.exports = function truncate (str, max) {
  let newStr = String(str)

  return newStr.length > max ? newStr.substr(0, max - 1) + '…' : newStr
}
