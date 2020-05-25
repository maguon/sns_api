var smsOptions = {
    action: 'SMS/TemplateSMS',
    accountType: 'Accounts',
    accountSID: '8aaf07085e6037fd015e6e6eb5e60254',
    accountToken: '8f987b4902314ad38024c4b0ced9f0b3',
    appSID: '8aaf07085e6037fd015e6e74ae830260',
    appToken: '8970618228fd7233d818a32709f11f6c',
    signTemplateId: 204915,
    server: 'app.cloopen.com',
    port: '8883'
};

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


module.exports = {
    smsOptions  : smsOptions ,
    xingeOptions  : xingeOptions,
    apnOptions : apnOptions
}