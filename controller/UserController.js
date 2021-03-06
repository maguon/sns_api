"use strict"
const mongoose = require('mongoose');
const axios = require('axios');
const ObjectID64 = require('objectid64')('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_');
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const systemConfig = require('../config/SystemConfig');
const logger = serverLogger.createLogger('UserController');

const {UserModel} = require('../modules');
const {UserDetailModel} = require('../modules');
const {UserDriveModel} = require('../modules');
const {UserDeviceModel} = require('../modules');
const {PrivacieModel} = require('../modules');
const {NoticeModel} = require('../modules');

const getUser = (req, res, next) => {
    let params = req.query;
    let query = UserModel.find({},{password:0});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getUser userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.phone){
        query.where('phone').equals(params.phone);
    }
    if(params.nickName){
        query.where('nick_name').equals({"$regex" : params.nickName,"$options":"$ig"});
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.authStatus){
        query.where('auth_status').equals(params.authStatus);
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserToken = (req, res, next) => {
    let path = req.params;
    let user ={
        userId:path.userId
    }

    const getUserStatus =()=>{
        return new Promise((resolve, reject) => {
            let query = UserModel.find({},{password:0});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('getUserToken userID format incorrect!');
                    resUtil.resetQueryRes(res,[],null);
                    return next();
                }
            }
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' getUserToken getUserStatus ' + error.message);
                    reject({err:reject.err});
                } else {
                    logger.info(' getUserToken getUserStatus ' + 'success');
                    if(rows[0]._doc.status == sysConsts.USER.status.disable){
                        reject({msg:systemMsg.USER_STATUS_ERROR});
                    }else{
                        user.status = rows[0]._doc.status;
                        resolve();
                    }
                }
            });
        });
    }
    const removeAndSaveToken =()=>{
        return new Promise((resolve, reject) => {
            user.accessToken = oAuthUtil.createAccessToken(oAuthUtil.clientType.user,user.userId,user.status);
            oAuthUtil.removeToken({accessToken:path.token},function(error,result){
                if(error) {
                    logger.error('getUserToken removeAndSaveToken ' + error.stack);
                    reject({err:error.stack});
                }else {
                    oAuthUtil.saveToken(user,function(error,result){
                        if(error){
                            logger.error('getUserToken removeAndSaveToken ' + error.stack);
                            reject({err:error.stack});
                        }else{
                            logger.info('getUserToken removeAndSaveToken ' + path.userId+ " success");
                            resUtil.resetQueryRes(res,user,null);
                            return next();
                        }
                    })
                }
            });
        });
    }
    getUserStatus()
        .then(removeAndSaveToken)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const getUserInfoAndDetail = (req, res, next) => {
    let path = req.params;
    let aggregate_limit = [];
    if(path.userId){
        if(path.userId.length == 24){
            aggregate_limit.push({
                $match: {
                    _id :  mongoose.mongo.ObjectId(path.userId)
                }
            });
        }else{
            logger.info('getUserInfoAndDetail userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    aggregate_limit.push({
        $project: {
            password:0,
            auth_time:0,
        }
    });
    aggregate_limit.push({
        $lookup: {
            from:"user_details",
            localField:"_user_detail_id",
            foreignField:"_id",
            as:"user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from:"user_drives",
            localField:"_user_drive_id",
            foreignField:"_id",
            as:"user_drive_info"
        }
    });
    UserModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserInfoAndDetail ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserInfoAndDetail ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "user_details",
            localField: "_user_detail_id",
            foreignField: "_id",
            as: "user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from:"user_drives",
            localField:"_user_drive_id",
            foreignField:"_id",
            as:"user_drive_info"
        }
    });
    if (params.userId) {
        if (params.userId.length == 24) {
            matchObj._id = mongoose.mongo.ObjectId(params.userId);
        } else {
            logger.info(' getUserByAdmin userID format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phone) {
        if (params.phone.length == 11) {
            matchObj.phone = params.phone;
        } else {
            logger.info('getUserByAdmin phone format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phoneReg) {
        if (params.phoneReg.length >= 4) {
            matchObj.phone = {"$regex": params.phoneReg, "$options": "$ig"};
        } else {
            logger.info('getUserByAdmin phoneReg format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.authStatus) {
        matchObj.auth_status = Number(params.authStatus);
    }
    if (params.nickName) {
        matchObj["user_detail_info.nick_name"] = {"$regex": params.nickName, "$options": "$ig"};
    }
    if (params.cityName) {
        matchObj["user_detail_info.city_name"] = {"$regex": params.cityName, "$options": "$ig"};
    }
    if (params.sex) {
        matchObj["user_detail_info.sex"] = Number(params.sex);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj["created_at"] = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    aggregate_limit.push({
        $project: {
            "password": 0
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
    UserModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getFakeUserByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "user_details",
            localField: "_user_detail_id",
            foreignField: "_id",
            as: "user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from:"user_drives",
            localField:"_user_drive_id",
            foreignField:"_id",
            as:"user_drive_info"
        }
    });
    if (params.userId) {
        if (params.userId.length == 24) {
            matchObj._id = mongoose.mongo.ObjectId(params.userId);
        } else {
            logger.info(' getFakeUserByAdmin userID format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phone) {
        matchObj.phone = params.phone;
    }
    if (params.phoneReg) {
        if (params.phoneReg.length >= 4) {
            matchObj.phone = {"$regex": params.phoneReg, "$options": "$ig"};
        } else {
            logger.info('getFakeUserByAdmin phoneReg format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.nickName) {
        matchObj["user_detail_info.nick_name"] = {"$regex": params.nickName, "$options": "$ig"};
    }
    if (params.cityName) {
        matchObj["user_detail_info.city_name"] = {"$regex": params.cityName, "$options": "$ig"};
    }
    if (params.sex) {
        matchObj["user_detail_info.sex"] = Number(params.sex);
    }
    if (params.status) {
        matchObj["status"] = Number(params.status);
    }
    if (params.type) {
        matchObj["type"] = Number(params.type);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj["created_at"] = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    matchObj.fake_type = sysConsts.USER.fake_type.fakeUser;
    aggregate_limit.push({
        $project: {
            "password": 0
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
    UserModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getFakeUserByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFakeUserByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserCountByAdmin = (req, res, next) => {
    let query = UserModel.find({});
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getUserCountByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserCountByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserTodayCountByAdmin = (req, res, next) => {
    let query = UserModel.find({});
    let today = new Date();
    let startDay = new Date(moment(today).format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).add(1, 'days').format('YYYY-MM-DD'));
    if(startDay && endDay){
        query.where('created_at').equals({$gte: startDay,$lt: endDay});
    }
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getUserTodayCountByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserTodayCountByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUser = (req, res, next) => {
    const query= req.query;
    let bodyParams = req.body;
    let imUserInfo = {
        "user": "",
        "password": ""
    };
    //判断该用户是否已创建
    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUserPhone = UserModel.find({},{password:0});
            if(bodyParams.phone){
                queryUserPhone.where('phone').equals(bodyParams.phone);
            }
            queryUserPhone.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUser getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser getUserPhone ' + 'success');
                    if(rows.length == 0){
                        resolve();
                    }else{
                        logger.info(' createUser getUserPhone '+ bodyParams.phone+ " Phone is registered! ");
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }
                }
            });
        });
    }
    //判断验证码
    const getPhoneCode = () =>{
        return new Promise((resolve, reject) => {
            oAuthUtil.getUserPhoneCode({phone:bodyParams.phone},function (error,result) {
                if (error) {
                    logger.error(' createUser getPhoneCode ' + error.message);
                    reject({err: bodyParams.phone + "-" +systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else{
                    if(result == null || result.result== null || bodyParams.captcha != result.result.code){
                        logger.warn(' createUser getPhoneCode ' + 'failed');
                        reject({msg:systemMsg.USER_SMS_CAPTCHA_ERROR});
                    }else{
                        resolve();
                    }
                }
            });
        });
    }
    //保存新用户
    const createUserInfo = () =>{
        return new Promise((resolve, reject) => {
            if(bodyParams.password){
                bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
            }
            let userObj = bodyParams;
            userObj.status = sysConsts.USER.status.available;
            userObj.auth_status = sysConsts.USER.auth_status.certified;
            userObj.auth_time = new Date();
            let userModel = new UserModel(userObj);
            userModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserInfo ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserInfo ' + 'success');
                    if (result._doc) {
                        resolve(result._doc._id);
                    }else{
                        logger.info(' createUser createUserInfo '+ bodyParams.phone+ " Phone is registered! ");
                        reject({msg:systemMsg.USER_CREATE_ERROR});
                    }
                }
            });
        });
    }
    //创建用户详细信息
    const createUserDetail = (resUserId) =>{
        return new Promise((resolve,reject)=>{
            let newName = encrypt.randomString(5); //随机生成5个字符，为昵称初始化
            let userDetailModel = new UserDetailModel();
            userDetailModel._user_id = resUserId;
            userDetailModel.nick_name = newName;
            userDetailModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserDetail ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserDetail ' + 'success');
                    if (result._doc) {

                        let updateInfo= {
                            userId: resUserId,
                            userDetailId: result._doc._id,
                        };
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.USER_CREATE_DETAIL_ERROR});
                    }
                }
            });
        });
    }
    //创建用户驾驶信息
    const createUserDrive = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userDriveModel = new UserDriveModel();
            userDriveModel._user_id = updateInfo.userId;
            userDriveModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserDrive ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserDrive ' + 'success');
                    if (result._doc) {
                        updateInfo.userDriveId = result._doc._id;
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.USER_DRIVE_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    //创建用户隐私设置信息
    const createUserPrivacie = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userPrivacieModel = new PrivacieModel();
            userPrivacieModel._user_id = updateInfo.userId;
            userPrivacieModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserPrivacie ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserPrivacie ' + 'success');
                    if (result._doc) {
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.SYS_INTERNAL_ERROR_MSG});
                    }
                }
            });
        });
    }
    //创建用户通知设置信息
    const createUserNotice = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userNoticeModel = new NoticeModel();
            userNoticeModel._user_id = updateInfo.userId;
            userNoticeModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserNotice ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserNotice ' + 'success');
                    if (result._doc) {
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.SYS_INTERNAL_ERROR_MSG});
                    }
                }
            });
        });
    }
    //IM请求创建用户
    const addImUser =(updateInfo)=>{
        return new Promise((resolve, reject) => {
            //IM-jid
            imUserInfo.user = ObjectID64.encode(updateInfo.userId.toString());
            //IM-pwd(jin-md5加密)
            if(imUserInfo.user){
                imUserInfo.password = encrypt.md5(imUserInfo.user,16);
            }
            imUserInfo.host = systemConfig.ejabberdIM.xmppHost;
            const imurl = '/api/server/register';
            axios({
                method: 'post',
                baseURL: systemConfig.ejabberdIM.admin,
                url: imurl,
                params:query,
                data: imUserInfo
            }).then(function (response) {
                resolve(updateInfo);
                logger.info(' createUser addImUser ' + 'success');
            }).catch(function (error) {
                resolve(updateInfo);
                logger.error(' createUser addImUser ' + error.stack);
            });
        })
    }
    //更新用户信息的关联ID
    const updateUserInfo = (updateInfo) =>{
        return new Promise(() => {
            let query = UserModel.find({});
            if(updateInfo.userId){
                query.where('_id').equals(updateInfo.userId);
            }
            UserModel.updateOne(query,{_user_detail_id:updateInfo.userDetailId, _user_drive_id:updateInfo.userDriveId, jid:imUserInfo.user, im_pwd:imUserInfo.password},
                function(error,result){
                if (error) {
                    logger.error(' createUser updateUserInfo ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createUser updateUserInfo ' + 'success');
                    resUtil.resetUpdateRes(res,result,null);
                    return next();
                }
            });
        });
    }

    getUserPhone()
        .then(getPhoneCode)
        .then(createUserInfo)
        .then(createUserDetail)
        .then(createUserDrive)
        .then(createUserPrivacie)
        .then(createUserNotice)
        .then(addImUser)
        .then(updateUserInfo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        });
}
const createFakeUserByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let userId;
    //判断该用户是否已创建
    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUserPhone = UserModel.find({},{password:0});
            if(bodyParams.phone){
                queryUserPhone.where('phone').equals(bodyParams.phone);
            }
            queryUserPhone.exec((error,rows)=> {
                if (error) {
                    logger.error(' createFakeUserByAdmin getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createFakeUserByAdmin getUserPhone ' + 'success');
                    if(rows.length == 0){
                        resolve();
                    }else{
                        logger.info(' createFakeUserByAdmin getUserPhone '+ bodyParams.phone+ " Phone is registered! ");
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }
                }
            });
        });
    }
    //保存新用户
    const createUserInfo = () =>{
        return new Promise((resolve, reject) => {
            if(bodyParams.password){
                bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
            }
            let userObj = bodyParams;
            userObj.fake_type = sysConsts.USER.fake_type.fakeUser;
            userObj.status = sysConsts.USER.status.available;
            userObj.auth_status = sysConsts.USER.auth_status.certified;
            userObj.auth_time = new Date();
            let userModel = new UserModel(userObj);
            userModel.save(function(error,result){
                if (error) {
                    logger.error(' createFakeUserByAdmin createUserInfo ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createFakeUserByAdmin createUserInfo ' + 'success');
                    if (result._doc) {
                        userId = result._doc._id;
                        resolve();
                    }else{
                        logger.info(' createFakeUserByAdmin createUserInfo '+ bodyParams.phone+ " Phone is registered! ");
                        reject({msg:systemMsg.USER_CREATE_ERROR});
                    }
                }
            });
        });
    }
    //创建用户详细信息
    const createUserDetail = () =>{
        return new Promise((resolve,reject)=>{
            let userDetailModel = new UserDetailModel();
            if(bodyParams.sex != undefined){
                userDetailModel.sex = bodyParams.sex;
            }
            if(bodyParams.nickName){
                userDetailModel.nick_name = bodyParams.nickName;
            }
            if(bodyParams.realName){
                userDetailModel.real_name = bodyParams.realName;
            }
            if(bodyParams.cityName){
                userDetailModel.city_name = bodyParams.cityName;
            }
            if(bodyParams.intro){
                userDetailModel.intro = bodyParams.intro;
            }
            if(bodyParams.avatar){
                userDetailModel.avatar = bodyParams.avatar;
            }
            userDetailModel._user_id = userId;
            userDetailModel.save(function(error,result){
                if (error) {
                    logger.error(' createFakeUserByAdmin createUserDetail ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createFakeUserByAdmin createUserDetail ' + 'success');
                    if (result._doc) {
                        resolve(result._doc._id);
                    }else{
                        reject({msg:systemMsg.USER_CREATE_DETAIL_ERROR});
                    }
                }
            });
        });
    }
    //创建用户驾驶信息
    const createUserDrive = (userDetailId) =>{
        return new Promise((resolve,reject)=>{
            let userDriveModel = new UserDriveModel();
            userDriveModel._user_id = userId;
            userDriveModel.save(function(error,result){
                if (error) {
                    logger.error(' createFakeUserByAdmin createUserDrive ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createFakeUserByAdmin createUserDrive ' + 'success');
                    if (result._doc) {
                        let updateInfo={
                            userDetailId : userDetailId,
                            userDriveId: result._doc._id
                        }
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.USER_DRIVE_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    //创建用户隐私设置信息
    const createUserPrivacie = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userPrivacieModel = new PrivacieModel();
            userPrivacieModel._user_id = userId;
            userPrivacieModel.save(function(error,result){
                if (error) {
                    logger.error(' createFakeUserByAdmin createUserPrivacie ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createFakeUserByAdmin createUserPrivacie ' + 'success');
                    if (result._doc) {
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.SYS_INTERNAL_ERROR_MSG});
                    }
                }
            });
        });
    }
    //创建用户通知设置信息
    const createUserNotice = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userNoticeModel = new NoticeModel();
            userNoticeModel._user_id = userId;
            userNoticeModel.save(function(error,result){
                if (error) {
                    logger.error(' createFakeUserByAdmin createUserNotice ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createFakeUserByAdmin createUserNotice ' + 'success');
                    if (result._doc) {
                        resolve(updateInfo);
                    }else{
                        reject({msg:systemMsg.SYS_INTERNAL_ERROR_MSG});
                    }
                }
            });
        });
    }
    //更新用户信息的关联ID
    const updateUserInfo = (updateInfo) =>{
        return new Promise(() => {
            let query = UserModel.find({});
            if(userId){
                query.where('_id').equals(userId);
            }
            UserModel.updateOne(query,{_user_detail_id:updateInfo.userDetailId,_user_drive_id:updateInfo.userDriveId},function(error,result){
                if (error) {
                    logger.error(' createFakeUserByAdmin updateUserInfo ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createFakeUserByAdmin updateUserInfo ' + 'success');
                    resUtil.resetUpdateRes(res,result,null);
                    return next();
                }
            });
        });
    }
    getUserPhone()
        .then(createUserInfo)
        .then(createUserDetail)
        .then(createUserDrive)
        .then(createUserPrivacie)
        .then(createUserNotice)
        .then(updateUserInfo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        });
}
const updateUserType = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateUserType userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    UserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserType ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserType ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const updatePassword = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updatePassword userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    const getPassword =()=>{
        return new Promise((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' updatePassword getPassword ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' updatePassword getPassword ' + 'success');
                    if(rows.length < 1){
                        logger.info(' updatePassword getPassword '+ path.userId + " The user does not exist！");
                        reject({msg: systemMsg.CUST_ID_NULL_ERROR});
                    }else{
                        if(rows[0]._doc.status == sysConsts.USER.status.disable){
                            logger.info(' updatePassword getPassword '+ path.userId + " The user has been deactivated!");
                            reject({msg:systemMsg.USER_STATUS_ERROR});
                        }else{
                            resolve(rows);
                        }
                    }
                }
            });
        });
    }
    const updatePassword =(userInfo)=>{
        return new Promise((resolve, reject) => {
            if(bodyParams.oldPassword){
                bodyParams.oldPasswordEnc = encrypt.encryptByMd5NoKey(bodyParams.oldPassword);
            }
            if(userInfo[0]._doc.password == bodyParams.oldPasswordEnc){
                if(bodyParams.newPassword){
                    bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.newPassword);
                    UserModel.updateOne(query,bodyParams,function(error,result){
                        if (error) {
                            logger.error(' updatePassword updatePassword ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updatePassword  updatePassword ' + 'success');
                            resUtil.resetUpdateRes(res,result,null);
                            return next();
                        }
                    });
                }else{
                    logger.info(' updatePassword updatePassword '+ bodyParams.newPassword + " New password error!");
                    reject({msg:systemMsg.USER_NEW_PASSWORD_ERROR});
                }
            }else{
                logger.info(' updatePassword updatePassword '+ bodyParams.oldPasswordEnc + " Old password error!");
                reject({msg:systemMsg.USER_OLD_PASSWORD_ERROR});
            }
        });
    }
    getPassword()
        .then(updatePassword)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updatePasswordByPhone = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    //判断验证码是否正确
    const getCode =()=>{
        return new Promise((resolve, reject) => {
            oAuthUtil.getUserPhoneCode({phone:path.phone},(error,rows)=>{
                if(error){
                    logger.error('updatePasswordByPhone getCode ' + error.message);
                    reject(error);
                }else{
                    if(rows && rows.result.code !=bodyParams.code ){
                        logger.info('updatePasswordByPhone getCode ' + 'Verification code error!');
                        resUtil.resetFailedRes(res,'验证码错误',null);
                    }else{
                        logger.info('updatePasswordByPhone getCode '+'success');
                        resolve();
                    }
                }
            });
        });
    }
    //判断该用户是否存在
    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUser = UserModel.find({});
            if(path.phone){
                queryUser.where('phone').equals(path.phone);
            }
            queryUser.exec((error,rows)=> {
                if (error) {
                    logger.error(' updatePasswordByPhone getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' updatePasswordByPhone getUserPhone ' + 'success');
                    if(rows.length == 0){
                        logger.info(' updatePasswordByPhone getUserPhone '+ path.phone + " The user does not exist!");
                        reject({msg:systemMsg.CUST_ID_NULL_ERROR});
                    }else{
                        if(rows[0]._doc.status == sysConsts.USER.status.disable){
                            logger.info(' updatePasswordByPhone getUserPhone '+ path.phone + " The user has been deactivated!");
                            reject({msg:systemMsg.USER_STATUS_ERROR});
                        }else{
                            resolve(rows[0]._doc._id);
                        }
                    }
                }
            });
        });
    }
    //更换密码
    const updateUserPassword =(userId)=>{
        return new Promise(() => {
            bodyParams.auth_status = sysConsts.USER.auth_status.certified;
            bodyParams.auth_time = new Date();
            bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.newPassword);
            UserModel.updateOne({_id:userId},bodyParams,function(error,result){
                if (error) {
                    logger.error(' updatePasswordByPhone updateUserPassword ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updatePasswordByPhone  updateUserPassword ' + 'success');
                    resUtil.resetUpdateRes(res,result,null);
                    return next();
                }
            });
        });
    }
    getCode()
        .then(getUserPhone)
        .then(updateUserPassword)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updatePhone = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updatePhone userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    //判断手机号是否已经注册
    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUserPhone = UserModel.find({},{password:0});
            if(bodyParams.phone){
                queryUserPhone.where('phone').equals(bodyParams.phone);
            }
            queryUserPhone.exec((error,rows)=> {
                if (error) {
                    logger.error(' updatePhone getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' updatePhone getUserPhone ' + 'success');
                    if(rows.length == 0){
                        resolve();
                    }else{
                        logger.info(' updatePhone  getUserPhone ' + bodyParams.phone + " Phone is registered!");
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }
                }
            });
        });
    }
    const getCode =()=>{
        return new Promise((resolve, reject) => {
            oAuthUtil.getUserPhoneCode({phone:bodyParams.phone},(error,rows)=>{
                if(error){
                    logger.error('updatePhone getUserPhoneCode ' + error.message);
                    reject(error);
                }else{
                    if(rows && rows.result.code !=bodyParams.code ){
                        logger.info('updatePhone getUserPhoneCode ' + 'Verification code error!');
                        resUtil.resetFailedRes(res,'验证码错误',null);
                    }else{
                        logger.info('updatePhone getUserPhoneCode '+'success');
                        resolve();
                    }
                }
            });
        });
    }
    const updateUserPhone =()=>{
        return new Promise(() => {
            bodyParams.auth_status = sysConsts.USER.auth_status.certified;
            bodyParams.auth_time = new Date();
            UserModel.updateOne(query,bodyParams,function(error,result){
                if (error) {
                    logger.error(' updatePhone updateUserPhone ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updatePhone  updateUserPhone ' + 'success');
                    resUtil.resetUpdateRes(res,result,null);
                    return next();
                }
            });
        });
    }
    getUserPhone()
        .then(getCode)
        .then(updateUserPhone)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateUserStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateUserStatus userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    UserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserStatus ' + 'success');;
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const updateUserAuthStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateUserAuthStatus userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(bodyParams.authStatus){
        bodyParams.auth_status = bodyParams.authStatus;
    }else{
        logger.info('updateUserAuthStatus authStatus format incorrect!');
        resUtil.resetQueryRes(res,[],null);
        return next();
    }
    UserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserAuthStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserAuthStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const userLogin = (req, res, next) => {
    let bodyParams = req.body;
    let user = {};
    let LogerFlag = 0;//1:手机号，2：昵称
    let userName = bodyParams.userName;
    if(/^1(3|4|5|6|7|8|9)\d{9}$/.test(userName)){
        //手机号
        LogerFlag = 1;
    }
    const getUser = () =>{
        return new Promise((resolve,reject)=> {
            let aggregate_limit_user = [];
            let user_matchObj = {};
            aggregate_limit_user.push({
                $lookup: {
                    from:"user_details",
                    localField:"_user_detail_id",
                    foreignField:"_id",
                    as:"user_detail_info"
                }
            });
            if(bodyParams.userName){
                user_matchObj.phone =  bodyParams.userName;
            }
            if (bodyParams.password) {
                user_matchObj.password =  encrypt.encryptByMd5NoKey(bodyParams.password);
            }
            aggregate_limit_user.push({
                $match: user_matchObj
            });
            aggregate_limit_user.push({
                $project: {
                    password:0,
                    auth_time:0,
                }
            });
            UserModel.aggregate(aggregate_limit_user).exec((error,rows)=> {
                if (error) {
                    logger.error(' getUser ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getUser ' + 'success');
                    if (rows.length != 0) {
                        logger.info(' userLogin getUser ' + 'success');
                        if(rows[0].status == sysConsts.USER.status.disable){
                            logger.info(' userLogin getUser ' + bodyParams.userName + ' The user has been deactivated ');
                            reject({msg:systemMsg.USER_STATUS_ERROR});
                        }else{
                            resolve(rows[0]);
                        }
                    } else {
                        logger.info(  bodyParams.userName +' userLogin username or password' + 'not verified!');
                        reject({msg: systemMsg.CUST_LOGIN_USER_PSWD_ERROR});
                    }
                }
            });
        });
    }
    const getUserDetail = () =>{
        return new Promise((resolve,reject)=> {
            let aggregate_limit = [];
            let matchObj = {};
            aggregate_limit.push({
                $lookup: {
                    from:"user_details",
                    localField:"_user_detail_id",
                    foreignField:"_id",
                    as:"user_detail_info"
                }
            });
            if(bodyParams.userName){
                matchObj["user_detail_info.nick_name"] =  bodyParams.userName;
            }
            if (bodyParams.password) {
                matchObj.password =  encrypt.encryptByMd5NoKey(bodyParams.password);
            }
            aggregate_limit.push({
                $match: matchObj
            });
            aggregate_limit.push({
                $project: {
                    password:0,
                    auth_time:0,
                }
            });
            UserModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' getUserDetail ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getUserDetail ' + 'success');
                    if (rows.length != 0) {
                        logger.info(' userLogin getUserDetail ' + 'success');
                        if(rows[0].status == sysConsts.USER.status.disable){
                            logger.info(' userLogin getUserDetail ' + bodyParams.userName + ' The user has been deactivated ');
                            reject({msg:systemMsg.USER_STATUS_ERROR});
                        }else{
                            resolve(rows[0]);
                        }
                    } else {
                        logger.info(  bodyParams.userName +' userLogin username or password' + 'not verified!');
                        reject({msg:systemMsg.CUST_LOGIN_USER_PSWD_ERROR});
                    }
                }
            });
        });
    }
    const loginSaveToken = (userInfo) =>{
        return new Promise((resolve, reject)=>{
            user.userId = userInfo._id.toString();
            user.userName = userInfo.user_detail_info[0].nick_name;
            user.status = userInfo.status;
            user.type = userInfo.type;
            //添加返回jid
            user.jid = userInfo.jid;
            user.impwd = userInfo.im_pwd;
            user.accessToken = oAuthUtil.createAccessToken(oAuthUtil.clientType.user,user.userId,user.status);
            oAuthUtil.saveToken(user,function(error,result){
                if(error){
                    logger.error('userLogin loginSaveToken ' + error.stack);
                    reject({err:systemMsg.SYS_INTERNAL_ERROR_MSG});
                }else{
                    logger.info('userLogin loginSaveToken ' + user.userId + " success");
                    resolve(user);
                }
            });
        });
    }
    const updateLastLogin = (user) =>{
        return new Promise(() => {
            let query = UserModel.find({});
            if(user.userId){
                if(user.userId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(user.userId));
                }else{
                    logger.info('userLogin updateLastLogin userId format incorrect!');
                    resUtil.resetQueryRes(res,[],null);
                    return next();
                }
            }
            UserModel.updateOne(query,{last_login_on:new Date()},function(error,result){
                if (error) {
                    logger.error(' userLogin updateLastLogin ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' userLogin updateLastLogin ' + 'success');
                    resUtil.resetQueryRes(res,user,null);
                    return next();
                }
            });
        });
    }
    if(LogerFlag == 1){
        getUser()
            .then(loginSaveToken)
            .then(updateLastLogin)
            .catch((reject)=>{
                if(reject.err) {
                    resUtil.resetFailedRes(res, reject.err);
                }else{
                    resUtil.resetFailedRes(res, reject.msg);
                }
            })
    }else{
        logger.info(  bodyParams.userName +' userLogin username or password' + 'not verified!');
        resUtil.resetFailedRes(res, systemMsg.CUST_LOGIN_USER_PSWD_ERROR);
        // getUserDetail()
        //     .then(loginSaveToken)
        //     .then(updateLastLogin)
        //     .catch((reject)=>{
        //         if(reject.err) {
        //             resUtil.resetFailedRes(res, reject.err);
        //         }else{
        //             resUtil.resetFailedRes(res, reject.msg);
        //         }
        //     })
    }
}
const userLogout = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    //判断userId + deviceToken 唯一
    if(path.userId && (bodyParams.deviceToken !== undefined) && (bodyParams.deviceType !== undefined )){
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
        if(bodyParams.deviceType){
            queryUserDevice.where('device_type').equals(bodyParams.deviceType);
        }
        //根据 该用户 和 设备标号，更新status 为退出登录状态
        UserDeviceModel.findOneAndUpdate(queryUserDevice,{ $set: { status: -1 } }).exec((error,rows)=> {
            if (error) {
                logger.error(' userLogout ' + error.message);
            } else {
                logger.info(' userLogout findOneAndUpdate ' + 'success');
                resUtil.resetQueryRes(res, "OK",{});
                return next();
            }
        });
    }else{
        logger.info(' userLogout ' + 'success');
        resUtil.resetQueryRes(res, "OK",{});
        return next();
    }
}
module.exports = {
    getUser,
    getUserToken,
    getUserInfoAndDetail,
    getUserByAdmin,
    getFakeUserByAdmin,
    getUserCountByAdmin,
    getUserTodayCountByAdmin,
    createUser,
    createFakeUserByAdmin,
    updateUserType,
    updatePassword,
    updatePasswordByPhone,
    updatePhone,
    updateUserStatus,
    updateUserAuthStatus,
    userLogin,
    userLogout
};