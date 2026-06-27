const fs = require('fs');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

/**
 * Writes a structured log message to stdout and a rotating-style log file.
 *
 * @param {string} level - Log level such as info, warn, error.
 * @param {string} message - Human-readable summary of the event.
 * @param {object} [meta={}] - Additional structured data.
 */
function writeLog(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = `${JSON.stringify(entry)}\n`;
  fs.appendFileSync(logFile, line, 'utf8');
  console.log(line.trim());
}

module.exports = {
  info: (message, meta) => writeLog('info', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
};
