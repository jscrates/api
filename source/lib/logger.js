const createLogger = (prefix = 'logger') => {
  return (...message) => {
    return console.log(`[${prefix}]:`, ...message)
  }
}

module.exports = createLogger
