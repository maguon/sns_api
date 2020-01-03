"use strict"
const mongoose = require('mongoose');
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserController');

const {UserModel} = require('../modules');
const {UserDetailModel} = require('../modules');
const {UserDriveModel} = require('../modules');
const {PrivacySettingsModel} = require('../modules');
const {NotificationSettingsModel} = require('../modules');

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
    if(params.auth_status){
        query.where('auth_status').equals(params.auth_status);
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
            })
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
            localField:"_userDetailId",
            foreignField:"_id",
            as:"user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from:"user_drive_infos",
            localField:"_userDriveId",
            foreignField:"_id",
            as:"user_drive_info"
        }
    });
    UserModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserInfoAndDetail ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
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
            from: "user_infos",
            localField: "_userId",
            foreignField: "_id",
            as: "user_login_info"
        }
    });
    if (params.userId) {
        if (params.userId.length == 24) {
            matchObj._userId = mongoose.mongo.ObjectId(params.userId);
        } else {
            logger.info('getUserByAdmin userID format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phone) {
        if (params.phone.length == 11) {
            matchObj["user_login_info.phone"] = params.phone;
        } else {
            logger.info('getUserByAdmin phone format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.phoneReg) {
        if (params.phoneReg.length >= 4) {
            matchObj["user_login_info.phone"] = {"$regex": params.phoneReg, "$options": "$ig"};
        } else {
            logger.info('getUserByAdmin phoneReg format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if (params.auth_status) {
        matchObj["user_login_info.auth_status"] = Number(params.auth_status);
    }
    if (params.nickName) {
        matchObj["nick_name"] = {"$regex": params.nickName, "$options": "$ig"};
    }
    if (params.cityName) {
        matchObj["city_name"] = {"$regex": params.cityName, "$options": "$ig"};
    }
    if (params.sex) {
        matchObj.sex = Number(params.sex);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj["created_at"] = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
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
    UserDetailModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getUserByAdmin ' + 'success');
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
                    logger.error(' createUser getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser getUserPhone ' + 'success');
                    if(rows.length > 0){
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }else{
                        resolve();
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
                    reject({err:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else{
                    if(result == null || result.result== null || bodyParams.captcha != result.result.code){
                        logger.warn(' createUser getPhoneCode ' + 'failed');
                        reject({msg:systemMsg.USER_SMS_CAPTCHA_ERROR});
                    }else{
                        resolve();
                    }
                }
            })
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
            userObj.auth_status = sysConsts.USER.auth_status.uncertified;
            let userModel = new UserModel(userObj);
            userModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserInfo ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserInfo ' + 'success');
                    if (result._doc) {
                        userId = result._doc._id
                        resolve();
                    }else{
                        reject({msg:systemMsg.USER_CREATE_ERROR});
                    }
                }
            })
        });
    }
    //创建用户详细信息
    const createUserDetail = () =>{
        return new Promise((resolve,reject)=>{
            let newName = encrypt.randomString(5);
            let userDetailModel = new UserDetailModel();
            userDetailModel._userId = userId;
            userDetailModel.nick_name = newName;
            userDetailModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserDetail ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserDetail ' + 'success');
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
            userDriveModel._userId = userId;
            userDriveModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserDrive ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserDrive ' + 'success');
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
    const createUserPrivacy = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userPrivacyModel = new PrivacySettingsModel();
            userPrivacyModel._userId = userId;
            userPrivacyModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserPrivacy ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserPrivacy ' + 'success');
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
    const createUserNotification = (updateInfo) =>{
        return new Promise((resolve,reject)=>{
            let userNotificationModel = new NotificationSettingsModel();
            userNotificationModel._userId = userId;
            userNotificationModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserNotification ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUser createUserNotification ' + 'success');
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
        return new Promise((() => {
            let query = UserModel.find({});
            if(userId){
                query.where('_id').equals(userId);
            }
            UserModel.updateOne(query,{_userDetailId:updateInfo.userDetailId,_userDriveId:updateInfo.userDriveId},function(error,result){
                if (error) {
                    logger.error(' createUser updateUserInfo ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createUser updateUserInfo ' + 'success');
                    resUtil.resetUpdateRes(res,result,null);
                    return next();
                }
            })
        }));
    }
    getUserPhone()
        .then(getPhoneCode)
        .then(createUserInfo)
        .then(createUserDetail)
        .then(createUserDrive)
        .then(createUserPrivacy)
        .then(createUserNotification)
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
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
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
                        reject({msg:"该用户未注册！"});
                    }else{
                        if(rows[0]._doc.status == sysConsts.USER.status.disable){
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
                            console.log('rows:',result);
                            resUtil.resetUpdateRes(res,result,null);
                            return next();
                        }
                    })
                }else{
                    reject({msg:systemMsg.USER_NEW_PASSWORD_ERROR});
                }
            }else{
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
                        logger.warn('updatePasswordByPhone getCode ' + 'Verification code error!');
                        resUtil.resetFailedRes(res,'验证码错误',null);
                    }else{
                        logger.info('updatePasswordByPhone getCode '+'success');
                        resolve();
                    }
                }
            })
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
                    if(rows.length > 0){
                        if(rows[0]._doc.status == sysConsts.USER.status.disable){
                            reject({msg:systemMsg.USER_STATUS_ERROR});
                        }else{
                            resolve(rows[0]._doc._id);
                        }
                    }else{
                        reject({msg:systemMsg.CUST_ID_NULL_ERROR});
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
            })
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
                    if(rows.length > 0){
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }else{
                        resolve();
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
                        logger.warn('updatePhone getUserPhoneCode ' + 'Verification code error!');
                        resUtil.resetFailedRes(res,'验证码错误',null);
                    }else{
                        logger.info('updatePhone getUserPhoneCode '+'success');
                        resolve();
                    }
                }
            })
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
            })
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
            logger.info(' updateUserStatus ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
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
    UserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserAuthStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserAuthStatus ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const userLogin = (req, res, next) => {
    let bodyParams = req.body;
    let UserId;
    let user = {};
    const getUser = () =>{
        return new Promise((resolve,reject)=> {
            let query = UserModel.find({});
            if (bodyParams.userName) {
                query.where('phone').equals(Number(bodyParams.userName));
            }
            if (bodyParams.password) {
                bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
                query.where('password').equals(bodyParams.password);
            }
            query.exec((error, rows) => {
                if (error) {
                    logger.error(' userLogin getUser ' + error.message);
                    reject({err: error});
                } else {
                    if (rows.length != 0) {
                        logger.info(' userLogin getUser ' + 'success');
                        if(rows[0]._doc.status == sysConsts.USER.status.disable){
                            reject({msg:systemMsg.USER_STATUS_ERROR});
                        }else{
                            resolve(rows[0]);
                        }
                    } else {
                        logger.warn(' userLogin username or password' + 'not verified!');
                        reject({msg:systemMsg.CUST_LOGIN_USER_PSWD_ERROR});
                    }

                }
            });
        });
    }
    const loginSaveToken = (userInfo) =>{
        return new Promise((resolve, reject)=>{
            UserId = userInfo._doc._id.toString();
            user.userId = userInfo._doc._id.toString();
            user.userName = userInfo.nickName;
            user.status = userInfo.status;
            user.type = userInfo.type;

            user.accessToken = oAuthUtil.createAccessToken(oAuthUtil.clientType.user,user.userId,user.status);
            oAuthUtil.saveToken(user,function(error,result){
                if(error){
                    logger.error('userLogin loginSaveToken ' + error.stack);
                    return next(sysError.InternalError(error.message,sysMsg.InvalidArgument))
                }else{
                    logger.info('userLogin loginSaveToken ' + user.userId + " success");
                    resolve(user);
                }
            })

        });
    }
    const updateLastLogin = (user) =>{
        return new Promise(() => {
            let query = UserModel.find({});
            if(UserId){
                if(UserId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(UserId));
                }else{
                    logger.info('userLogin updateLastLogin userID format incorrect!');
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
                    console.log('rows:',result);
                    resUtil.resetQueryRes(res,user,null);
                    return next();
                }
            })
        });
    }
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
}
module.exports = {
    getUser,
    getUserToken,
    getUserInfoAndDetail,
    getUserByAdmin,
    getUserCountByAdmin,
    getUserTodayCountByAdmin,
    createUser,
    updateUserType,
    updatePassword,
    updatePasswordByPhone,
    updatePhone,
    updateUserStatus,
    updateUserAuthStatus,
    userLogin
};