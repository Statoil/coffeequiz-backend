const winston = require('winston');
const dateformat = require('dateformat');
const path = require("path");
const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'debug';

winston.configure({
    level: logLevel,
    transports: [
        new (winston.transports.Console)({
            formatter: logFormatter
        }),
        new (winston.transports.File)({
            filename: path.join(__dirname, 'logs/server.log'),
            json: false,
            formatter: logFormatter
        })
    ]
});

function logFormatter(options) {
    // Return string will be passed to logger.
    const messageText = options.message ? options.message : '';
    const metadataText = (options.meta && Object.keys(options.meta).length) ? JSON.stringify(options.meta) : '';
    return `${timestamp()}  ${options.level.toUpperCase()}  ${messageText} ${metadataText}`;
}

function timestamp() {
    return dateformat(Date.now(), "yyyy-mm-dd hh:MM:ss,l");
}

module.exports = winston;
