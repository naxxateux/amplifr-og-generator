const chalk = require('chalk')

module.exports = function formattedLog (message, details, level) {
  let isError = level === 'error'
  let output = '\n'
  output += isError ? chalk.bgRed(' WARN ') : chalk.bgGreen(' INFO ')
  output += ' '
  output += chalk.bold(isError ? chalk.red(message) : chalk.green(message))
  output += chalk.gray(' at ' + new Date().toISOString())

  if (details) {
    output += '\n       '
  }

  if (details === null) {
    output += 'null'
  } else if (typeof details === 'object' && Object.keys(details).length === 0) {
    output += chalk.bold('No details')
  } else if (typeof details === 'object') {
    output +=
      chalk.bold('{ ') +
      Object.keys(details)
        .map(i => {
          if (typeof details[i] === 'function') {
            return '\n         ' + i
          } else {
            return (
              '\n         ' + i + ': ' + chalk.bold(JSON.stringify(details[i]))
            )
          }
        })
        .join(', ') +
      chalk.bold('\n       }')
  } else if (typeof details === 'string') {
    output += details
  } else if (details) {
    output += JSON.stringify(details)
  }

  console.log(output)
}
