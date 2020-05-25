/**
 * Created by yym xue on 20-5-25.
 */

const serverLogger = require('../util/ServerLogger');
var smsConfig = require('../config/SmsConfig.js');
var logger = serverLogger.createLogger('ApnUtil.js');
var apn = require('@parse/node-apn');


function pushMsg(params, callback) {
    let provider = new apn.Provider(smsConfig.apnOptions);

    provider.send(params.notification, params.deviceToken).then( (response) => {
        callback(null, response);
        // response.sent: Array of device tokens to which the notification was sent succesfully
        // response.failed: Array of objects containing the device token (`device`) and either an `error`, or a `status` and `response` from the API
    });
}

module.exports = {
    pushMsg : pushMsg
}