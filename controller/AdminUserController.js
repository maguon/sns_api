"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('AdminUserController');

const {AdminUserModel} = require('../modules');


const getAdminUser = (req, res, next) => {
    let params = req.query;
    let query = AdminUserModel.find({},{password:0});

    if(params.adminUserId){
        if(params.adminUserId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.adminUserId));
        }else{
            logger.info('getAdminUser  ID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.name){
        query.where('name').equals({"$regex": params.name, "$options": "$ig"});
    }
    if(params.realname){
        query.where('realname').equals({"$regex": params.realname, "$options": "$ig"});
    }
    if(params.phone){
        query.where('phone').equals(params.phone);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAdminUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAdminUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createAdminUser = (req, res, next) => {
    let bodyParams = req.body;
    //判断该用户名称是否存在
    const getAdmin = () =>{
        return new Promise((resolve, reject) => {
            let queryAdmin = AdminUserModel.find({},{password:0});
            if(bodyParams.name){
                queryAdmin.where('name').equals(bodyParams.name);
            }
            queryAdmin.exec((error,rows)=> {
                if (error) {
                    logger.error(' createAdminUser getAdminUser ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createAdminUser getAdminUser ' + 'success');
                    if(rows.length > 0){
                        reject({msg:systemMsg.CUST_SIGNUP_REGISTERED});
                    }else{
                        resolve();
                    }
                }
            });
        });
    }
    //保存管理员新数据
    const saveAdmin = ()=>{
        return new Promise((resolve, reject) => {
            let adminUserObj = bodyParams;
            adminUserObj.status = sysConsts.INFO.status.available;
            if(bodyParams.password){
                console.log(bodyParams.password);
                bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
            }
            let adminUserModel = new AdminUserModel(adminUserObj);
            adminUserModel.save(function(error,result){
                if (error) {
                    logger.error(' createAdminUser ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createAdminUser ' + 'success');
                    resUtil.resetCreateRes(res, result);
                    return next();
                }
            })
        });
    }
    getAdmin()
        .then(saveAdmin)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })

}
const updateAdminUserInfo = (req, res, next) => {
    let bodyParams = req.body;
    let query = AdminUserModel.find({});
    let path = req.params;
    if(path.adminUserId){
        if(path.adminUserId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.adminUserId));
        }else{
            logger.info('updateAdminUserInfo  ID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    AdminUserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAdminUserInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAdminUserInfo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateAdminUserStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = AdminUserModel.find({});
    let path = req.params;
    if(path.adminUserId){
        if(path.adminUserId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.adminUserId));
        }else{
            logger.info('updateAdminUserStatus  ID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    AdminUserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAdminUserStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAdminUserStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const adminUserLogin = (req, res, next) => {
    let bodyParams = req.body;
    //获取管理员信息
    const getAdmin = () =>{
        return new Promise((resolve,reject)=> {
            let query = AdminUserModel.find({});
            if (bodyParams.userName) {
                query.where('name').equals(bodyParams.userName);
            }
            if (bodyParams.password) {
                bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
                query.where('password').equals(bodyParams.password);
            }
            query.exec((error, rows) => {
                if (error) {
                    logger.error(' adminUserLogin getAdmin ' + error.message);
                    reject({err: error});
                } else {
                    if (rows.length != 0) {
                        logger.info(' adminUserLogin getAdmin ' + 'success');
                        if(rows[0]._doc.status == sysConsts.ADMIN.status.available){
                            resolve(rows[0]);
                        }else{
                            reject({msg:systemMsg.CUST_STATUS_ERROR});
                        }
                    } else {
                        logger.warn(' adminUserLogin username or password' + 'not verified!');
                        reject({msg:systemMsg.CUST_LOGIN_USER_PSWD_ERROR});
                    }

                }
            });
        });
    }
    //获取token
    const loginSaveToken = (adminInfo) =>{
        return new Promise(()=>{
            let admin = {
                adminId : adminInfo._doc._id.toString(),
                status : adminInfo.status,
                type: adminInfo.type
            }
            admin.accessToken = oAuthUtil.createAccessToken(oAuthUtil.clientType.admin,admin.adminId,admin.status);
            logger.info(admin.adminId );
            oAuthUtil.saveToken(admin,function(error,result){
                if(error){
                    logger.error('adminUserLogin loginSaveToken ' + error.stack);
                    return next(sysError.InternalError(error.message,sysMsg.InvalidArgument));
                }else{
                    logger.info('adminUserLogin loginSaveToken ' + admin.adminId + " success");
                    resUtil.resetQueryRes(res,admin,null);
                    return next();
                }
            })

        });
    }
    getAdmin()
        .then(loginSaveToken)
        .catch((reject)=>{
            if(reject.err) {
                resUtil.resetFailedRes(res, reject.err);
            }else{
                resUtil.resetFailedRes(res, reject.msg);
            }
        })

}
module.exports = {
    getAdminUser,
    createAdminUser,
    updateAdminUserInfo,
    updateAdminUserStatus,
    adminUserLogin
};