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
    //系统信息
    if(bodyParams.deviceInfo[0].deviceName){
        userDeviceObj["device_info.device_name"] = bodyParams.deviceInfo[0].deviceName ;
    }
    if(bodyParams.deviceInfo[0].osVersion){
        userDeviceObj["device_info.os_version"] = bodyParams.deviceInfo[0].osVersion ;
    }

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
const getUserDeviceByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "user_infos",
            localField: "_user_id",
            foreignField: "_id",
            as: "user_login_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from: "user_details",
            localField: "_user_id",
            foreignField: "_user_id",
            as: "user_detail_info"
        }
    });
    if (params.userDeviceId) {
        if (params.userDeviceId.length == 24) {
            matchObj._id = mongoose.mongo.ObjectId(params.userDeviceId);
        } else {
            logger.info(' getUserDeviceByAdmin userDeviceId format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.userId) {
        if (params.userId.length == 24) {
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        } else {
            logger.info(' getUserDeviceByAdmin userID format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phone) {
        if (params.phone.length == 11) {
            matchObj["user_login_info.phone"] = params.phone;
        } else {
            logger.info('getUserDeviceByAdmin phone format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phoneReg) {
        if (params.phoneReg.length >= 4) {
            matchObj["user_login_info.phone"] = {"$regex": params.phoneReg, "$options": "$ig"};
        } else {
            logger.info('getUserDeviceByAdmin phoneReg format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.version) {
        matchObj["version"] = {"$regex": params.version, "$options": "$ig"};
    }
    if (params.appType) {
        matchObj.app_type = Number(params.appType);
    }
    if (params.deviceType) {
        matchObj.device_type = Number(params.deviceType);
    }
    if (params.status) {
        matchObj.status = Number(params.status);
    }
    aggregate_limit.push({
        $project: {
            "user_login_info.password": 0
        }
    });
    aggregate_limit.push({
        $match: matchObj
    });
    if (params.start && params.size) {
        aggregate_limit.push(
            {
                $skip : Number(params.start)
            },{
                $limit : Number(params.size)
            }
        );
    };
    UserDeviceModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserDeviceByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserDeviceByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
module.exports = {
    createUserDevice,
    getUserDeviceByAdmin
};