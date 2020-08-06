/**
 * Created by yym on 2020/5/21.
 */

const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const smsConfig = require('../config/SmsConfig');
const xingeUtil = require('../util/XingeUtil');
const ApnUtil = require('../util/ApnUtil');
const apn = require('@parse/node-apn');
const logger = serverLogger.createLogger('PushMsgController');

const AllMsgPushUtil = require('../util/AllMsgPushUtil');

function pushMsgXinge(req,res,next){
    let params = req.query;
    params.title = "新消息";
    params.content ="您有新消息提醒！";
    xingeUtil.pushMsg(params,function(error,result){
        if (error) {
            logger.error(' pushMsgXinge ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' pushMsgXinge ' + 'success');
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    });
}

function pushMsgApn(req,res,next){
    let params = req.query;
    // let deviceTokens = ["834c8b48e6254e47435d74720b1d4a13e3e57d0bf318333c284c1db8ce8ddc58"];

    let notification = new apn.Notification();
    notification.alert = "您有新消息提醒!";
    notification.badge = 1;
    notification.sound = "default";
    notification.topic = "log-sns-ios";
    params.notification = notification;
    ApnUtil.pushMsg(params,function(error,result){
        if (error) {
            logger.error(' pushMsgApn ' + error);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' pushMsgApn ' + 'success');
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    })
}

function pushMsgAll(req,res,next){
    //走ALLMsgPushUtil
    let params = req.query;
    // params.userId ="5e4f43bde0d98903a7364113";
    // params.nickName = "美少女战士";
    // params.msg = "你真的很漂亮啊~~~你真的很漂亮啊~~~你真的很漂亮啊~~~你真的很漂亮啊~~~你真的很漂亮啊~~~";
    // params.msgType = 1;

    AllMsgPushUtil.mqPushMsg(params,function(error,result){
        if (error) {
            logger.error(' pushMsgXinge ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' pushMsgXinge ' + 'success');
            console.log("mqPushMsg返回结果：result:",result);
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    });
}

module.exports={
    pushMsgXinge : pushMsgXinge,
    pushMsgApn : pushMsgApn,
    pushMsgAll : pushMsgAll
}
