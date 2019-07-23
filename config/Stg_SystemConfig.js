
const logLevel = 'DEBUG';
const loggerConfig = {
    appenders: {
        console: { type: 'console' } ,
        file : {
            "type": "file",
            "filename": "../sns_api.html",
            "maxLogSize": 2048000,
            "backups": 10
        }
    },
    categories: { default: { appenders: ['console','file'], level: 'debug' } }
}


const mongoConfig = {
    connect : 'mongodb://127.0.0.1:27017/driver_sns',
    debug : true
}

const hosts = {
    auth:{
        host :"stg.myxxjs.com",
        port : 9009
    }
}

module.exports = { loggerConfig, logLevel , mongoConfig,hosts}
