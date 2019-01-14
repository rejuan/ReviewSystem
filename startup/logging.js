const winston = require("winston");
require('express-async-errors');

const errorStackTracerFormat = winston.format(info => {
    if (info.meta && info.meta instanceof Error) {
        info.message = `${info.message} ${info.meta.stack}`;
    }
    return info;
});

module.exports = function () {
    process.on("uncaughtException", ex => {
        winston.error(ex.message, ex);
        setTimeout(() => {
            process.exit(1);
        }, 4000);
    });

    process.on("unhandledRejection", ex => {
        throw ex;
    });

    winston.add(
        new winston.transports.File({
            filename: "logfile.log",
            format: winston.format.combine(
                winston.format.splat(),
                errorStackTracerFormat(),
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    );
};
