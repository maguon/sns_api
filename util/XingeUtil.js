/**
 * Created by yym xue on 20-5-22.
 */

const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
var smsConfig = require('../config/SmsConfig.js');
var logger = serverLogger.createLogger('XingeUtil.js');
var xinge = require('xinge');
var xingeApp = new xinge.XingeApp(smsConfig.xingeOptions.accessId, smsConfig.xingeOptions.secretKey);

function getBaseStyle() {
    var style = new xinge.Style();
    style.ring = 1;
    style.vibrate = 1;
    style.light = 1;
    style.builderId = 77;
    return style;
}

function getBaseAndroidMsg(title, content, style, action) {
    var androidMessage = new xinge.AndroidMessage();
    androidMessage.type = xinge.MESSAGE_TYPE_NOTIFICATION;
    androidMessage.title = title;
    androidMessage.content = content;
    androidMessage.style = style;
    androidMessage.action = action;
    androidMessage.expireTime = 2 * 60 * 60;
    androidMessage.multiPkg = 0;
    return androidMessage;
}

function getBaseAction() {
    var action = new xinge.ClickAction();
    action.actionType = xinge.ACTION_TYPE_ACTIVITY;
    return action;
}

function pushMsg(params, callback) {
    var message =  getBaseAndroidMsg(params.title, params.content, getBaseStyle(), getBaseAction());
    xingeApp.pushToSingleDevice(params.deviceToken, message, 0, function (error, result) {
        callback(error, result);
    });
}

module.exports = {
    pushMsg : pushMsg
}