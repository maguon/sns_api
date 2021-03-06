/**
 * Created by yym on 20-5-25.
 */

const serverLogger = require('../util/ServerLogger');
const systemConfig = require('../config/SystemConfig.js');
const logger = serverLogger.createLogger('ApnUtil.js');
const apn = require('@parse/node-apn');


function pushMsg(params, callback) {
    let provider = new apn.Provider(systemConfig.apnOptions);

    provider.send(params.notification, params.deviceToken).then( (response) => {
        callback(null, response);
        // response.sent: Array of device tokens to which the notification was sent succesfully
        // response.failed: Array of objects containing the device token (`device`) and either an `error`, or a `status` and `response` from the API
    });
}

module.exports = {
    pushMsg : pushMsg
}