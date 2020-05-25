/**
 * Created by yym on 2020/5/21.
 */

const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const smsConfig = require('../config/SmsConfig');
const xingeUtil = require('../util/XingeUtil');
const ApnUtil = require('../util/ApnUtil');
const apn = require('@parse/node-apn');
const logger = serverLogger.createLogger('PushMsgController');

function pushMsgXinge(req,res,next){
    let params = req.query;
    params.title = "任务消息";
    params.content ="你有新的路线任务";
    xingeUtil.pushMsg(params,function(error,result){
        if (error) {
            logger.error(' pushMsgXinge ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' pushMsgXinge ' + 'success');
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    })
}

function pushMsgApn(req,res,next){
    let params = req.query;
    // let deviceTokens = ["834c8b48e6254e47435d74720b1d4a13e3e57d0bf318333c284c1db8ce8ddc58"];

    let notification = new apn.Notification();
    notification.alert = "Hello, world!";
    notification.badge = 1;
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

module.exports={
    pushMsgXinge : pushMsgXinge,
    pushMsgApn : pushMsgApn
}
