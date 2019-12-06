"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserController');

const {UserModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUser = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserModel.find({},{password:0});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUser userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userDetailId){
        if(params.userDetailId.length == 24){
            query.where('_userDetailId').equals(mongoose.mongo.ObjectId(params.userDetailId));
        }else{
            logger.info('getUser userDetailID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.phone){
        query.where('phone').equals(params.phone);
    }
    if(params.nikename){
        query.where('nikename').equals(params.nikename);
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
const getUserInfoAndDetail = (req, res, next) => {
    let params = req.params;
    let query = UserModel.find({},{password:0});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getUserInfoAndDetail userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    query.populate({path:'_userDetailId'}).exec((error,rows)=> {
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
const createUser = (req, res, next) => {
    let bodyParams = req.body;
    let userId;
    if(bodyParams.password){
        console.log(bodyParams.password);
        bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
    }
    let userObj = bodyParams;
    userObj.status = sysConsts.USER.status.available;
    userObj.auth_status = sysConsts.USER.auth_status.uncertified;
    const createUserInfo = () =>{
        return new Promise(((resolve, reject) => {
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
        }));
    }
    const createUserDetail = () =>{
        return new Promise((resolve,reject)=>{
            let userDetailModel = new UserDetailModel();
            userDetailModel._userId = userId;
            userDetailModel.status = sysConsts.INFO.status.available;
            userDetailModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserDetail ' + error.message);
                    reject({err:error.message});
                } else {
                    if (result._doc) {
                        resolve(result._doc._id);
                    }else{
                        reject({msg:systemMsg.USER_CREATE_DETAIL_ERROR});
                    }
                }
            });
        });
    }
    const updateUserInfo = (userDetailId) =>{
        return new Promise((() => {
            let query = UserModel.find({});
            if(userId){
                query.where('_id').equals(userId);
            }

            UserModel.updateOne(query,{_userDetailId:userDetailId},function(error,result){
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
    createUserInfo()
        .then(createUserDetail)
        .then(updateUserInfo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        });
}
const updateUserInfo = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserInfo userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    UserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserInfo ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updatePassword = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserStatus userID format incorrect!');
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
                        resolve(rows);
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
const updatePhone = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserModel.find({});
    let params = req.params;
    let reqQuery = req.query;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserStatus userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    const getCode =()=>{
        return new Promise((resolve, reject) => {
            oAuthUtil.getUserPhoneCode({phone:params.phone},(error,rows)=>{
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
    getCode()
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
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userId));
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
const userLogin = (req, res, next) => {
    let bodyParams = req.body;
    let UserId;
    const getUser = () =>{
        return new Promise((resolve,reject)=> {
            let query = UserModel.find({});
            if (bodyParams.userName) {
                query.where('phone').equals(bodyParams.userName);
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
                        resolve(rows[0]);
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
            let user = {
                userId : userInfo._doc._id.toString(),
                userName : userInfo.nikename,
                status : userInfo.status,
                type: userInfo.type
            }
            user.accessToken = oAuthUtil.createAccessToken(oAuthUtil.clientType.user,user.userId,user.status);
            oAuthUtil.saveToken(user,function(error,result){
                if(error){
                    logger.error('userLogin loginSaveToken ' + error.stack);
                    return next(sysError.InternalError(error.message,sysMsg.InvalidArgument))
                }else{
                    logger.info('userLogin loginSaveToken ' + user.userId + " success");
                    resolve(user);
                    // resUtil.resetQueryRes(res,user,null);
                    // return next();
                }
            })

        });
    }
    const updateLastLogin = (user) =>{
        return new Promise((() => {
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
                    resUtil.resetUpdateRes(res,user,null);
                    return next();
                }
            })
        }));
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
    getUserInfoAndDetail,
    createUser,
    updateUserInfo,
    updatePassword,
    updatePhone,
    updateUserStatus,
    userLogin
};