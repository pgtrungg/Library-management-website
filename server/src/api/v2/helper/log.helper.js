const winston = require('winston');
const path = require('path');

module.exports = winston.createLogger({
  // format log
  format: winston.format.combine(
    winston.format.splat(),
    // time format
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    // colorize log
    winston.format.colorize(),
    // format log message
    winston.format.printf(
      log => {
        // if log has stack property, return stack
        if(log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
        return  `[${log.timestamp}] [${log.level}] ${log.message}`;
      },
    ),
  ),
  transports: [
    // write log to console
    new winston.transports.Console(),
    // write error log to file
    new winston.transports.File({
      level: 'error',
      filename: path.join(__dirname, 'errors.log')
    })
  ],
})
