"use strict"
const mongoose = require('mongoose');
const systemMsg = require('../util/SystemMsg');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserDeviceController');

const {UserDeviceModel} = require('../modules');

const createUserDevice = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userDeviceObj = bodyParams;
    if(path.userId){
        if(path.userId.length == 24){
            userDeviceObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createUserDevice  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(bodyParams.deviceToken){
        userDeviceObj.device_token = bodyParams.deviceToken ;
    }
    if(bodyParams.appType){
        userDeviceObj.app_type = bodyParams.appType ;
    }
    if(bodyParams.deviceType){
        userDeviceObj.device_type = bodyParams.deviceType ;
    }
    //设备登录状态：登录中
    userDeviceObj.status = 1 ;

    //判断userId + deviceToken 唯一
    let queryUserDevice = UserDeviceModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            queryUserDevice.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('createUserDevice _user_id format incorrect!');
            return next();
        }
    }
    if(bodyParams.deviceToken){
        queryUserDevice.where('device_token').equals(bodyParams.deviceToken);
    }
    //如果已存在 该用户 和 设备标号，则更新信息
    //如果不存在，新建数据
    UserDeviceModel.findOneAndUpdate(queryUserDevice,userDeviceObj,{new: true, upsert: true}).exec((error,rows)=> {
        if (error) {
            logger.error(' createUserDevice ' + error.message);
        } else {
            logger.info(' createUserDevice ' + 'success');
            resUtil.resetCreateRes(res, rows);
            return next();
        }
    });
}

module.exports = {
    createUserDevice
};