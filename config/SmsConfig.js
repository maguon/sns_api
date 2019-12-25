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
    accessId : 2100267013,
    accessKey : 'A7XR278C4CTR',
    secretKey : 'ea19617c98f096c3004d19f9330b880b'
}


module.exports = {
    smsOptions  : smsOptions ,
    xingeOptions  : xingeOptions
}