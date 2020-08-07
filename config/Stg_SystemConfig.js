
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

var xingeOptions  = {
    host : 'openapi.xg.qq.com',
    url : '/v2/push/single_device',
    accessId : 2100299077,
    accessKey : 'AR7S6KB7A17W',
    secretKey : '5c8a7384d4ed82f95fc9a298606c41db'
}

var apnOptions  = {
    token: {
        key: "/code/sns_api/push/AuthKey_7876U8X6FS.p8",
        keyId: "7876U8X6FS",
        teamId: "6A9XT8Y6LJ"
    },
    production: false
}

module.exports = { loggerConfig, logLevel , mongoConfig,hosts,xingeOptions,apnOptions}
