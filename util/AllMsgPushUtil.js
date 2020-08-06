/**
 * Created by yym xue on 20-5-28.
 */

const mongoose = require('mongoose');
const serverLogger = require('../util/ServerLogger');
const apnUtil = require('../util/ApnUtil');
const xingeUtil = require('../util/XingeUtil');
const logger = serverLogger.createLogger('AllMsgPushUtil.js');
const apn = require('@parse/node-apn');

const {UserDeviceModel} = require('../modules');
//消息队列的形式，发送信息

//发送到MQ里
//查询用户设备信息，判断是走Android or ios 接口推送消息。

/*
*
* @Description: 获取推送消息
*
* */
function getUserPushMsg(nickName,msg,msgType) {
    //msg 推送消息内容
    //msgType 推送消息类型 （1.文章评论 2.求助评论 3.评论回复 4.点赞 5.关注 6.投票结束）

    //返回的推送消息
    let msgTitle = {};
    let msgContent = {};


    switch (Number(msgType)) {
        case 1:
            //msgType 1.文章评论
            //消息推送标题
            msgContent = nickName + "评论了你";
            //消息内容推送以30位为准 后面加...
            // if(msg.length >= 30){
            //     let infoMsg = msg.substring(0,30);
            //     msgContent = infoMsg;
            //     msgContent += "...";
            // }else{
            //     msgContent = infoMsg;
            // }

            break;

        case 2:
            //msgType 2.求助评论
            //消息推送标题
            msgContent = nickName + "评论了你";
            //消息内容推送以30位为准 后面加...
            // if(msg.length >= 30){
            //     let infoHelp = msg.substring(0,30);
            //     msgContent.push(infoHelp);
            //     msgContent.push("...");
            // }else{
            //     msgContent = infoMsg;
            // }
            break;

        case 3:
            //msgType 3.评论回复
            //消息推送标题
            msgContent = nickName + "评论中回复了你";
            //消息内容推送以30位为准 后面加...
            // if(msg.length >= 30){
            //     let infoCom = msg.substring(0,30);
            //     msgContent.push(infoCom);
            //     msgContent.push("...");
            // }else{
            //     msgContent = infoMsg;
            // }
            break;
        case 4:
            //msgType 4.点赞
            msgContent = nickName + "点赞了你";
            break;
        case 5:
            //msgType 5.关注
            msgContent = nickName + "关注了你";
            break;
        case 6:
            //msgType 6.投票结束
            msgContent = "投票结束";
            break;
        default:
            msgContent = "您有一条新动态！";

    }

    let pushMsg = {
        title : msgTitle,
        msg : msgContent
    }

    return pushMsg;
}


/*
*
* @Description: 消息推送
*
* */
function mqPushMsg(params, callback) {
    //userID 接受消息人ID
    //nickName 发送消息人名称
    //msg 推送消息内容
    //msgType 推送消息类型 （1.文章评论 2.求助评论 3.评论回复 4.点赞 5.关注 6.投票结束）

    let pushMsg;

    //获取推送信息
    //参数：发送用户名称，评论内容，推送消息类型
    const getUserPushMsgArray = () =>{
        return new Promise((resolve) => {
            pushMsg = getUserPushMsg(params.nickName,params.msg,params.msgType);
            resolve();

        })
    }

    //获取用户设备信息，有可能多条
    const getUserDeviceArray = () =>{
        return new Promise((resolve, reject) => {
            let query = UserDeviceModel.find({});
            if(params.receivingUser){
                if(params.receivingUser.length == 24){
                    query.where('_user_id').equals(mongoose.mongo.ObjectId(params.receivingUser));
                    query.exec((error,rows)=> {
                        if (error) {
                            resolve();
                        } else {
                            resolve(rows);
                        }
                    });
                }else{
                    resolve();
                }
            }else{
                resolve();
            }
        });
    }

    const PromiseForEach = (arr, callback)=>{
        let realResult = [];
        let result = Promise.resolve();
        arr.forEach((item, index) => {
            result = result.then(() => {
                return callback(item).then((res) => {
                    realResult.push(res)
                })
            })
        })

        return result.then(() => {
            return realResult
        })
    }

    const pushMsgToUser = (userDevices) =>{
        return new Promise((resolve) => {
            if(userDevices == undefined || userDevices == null ){
                //不存在用户设备信息
                resolve({});
            }else{
                PromiseForEach(userDevices, (item) => {
                    return new Promise((resolve, reject) => {
                        if(item._doc.device_type == 1){

                            //设备类型：Android
                            let newParams = {
                                title : pushMsg.title,
                                content : pushMsg.msg,
                                deviceToken : item._doc.device_token
                            }

                            xingeUtil.pushMsg(newParams,function(error,result){
                                return resolve(result);
                            })

                        }else if(item._doc.device_type == 2){

                            //设备类型：IOS
                            let notification = new apn.Notification();
                            notification.alert = pushMsg.msg;
                            notification.badge = 1;
                            notification.sound = "default";
                            notification.topic = "log-sns-ios";

                            let newParams = {
                                notification : notification,
                                deviceToken : item._doc.device_token
                            }

                            //参数：params.notification, params.deviceToken
                            apnUtil.pushMsg(newParams,function(error,result){
                                return resolve(result);
                            })

                        }else{
                            return resolve({});
                        }

                    })

                }).then((data) => {
                    resolve(data);
                }).catch((err) => {
                    console.log("失败");
                    console.log(err)
                });

            }//else end
        })//new Promise end
    }//pushMsgToUser end

    const returnPushMsg = (result)=>{
        return new Promise(()=>{
            callback(null, result);
        });
    }

    getUserPushMsgArray()
        .then(getUserDeviceArray)
        .then(pushMsgToUser)
        .then(returnPushMsg)
        .catch((reject)=>{
            callback(null,null);
            return null;
        })
}

module.exports = {
    mqPushMsg : mqPushMsg
}