"use strict"
const mongoose = require('mongoose');
const Errors = require('restify-errors');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
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
            // return resUtil.resetFailedRes(res, systemMsg.SYS_OBJECT_ID_ERROR);
        }
        // query.where('_id').equals(params.adminUserId);
    }
    if(params.name){
        query.where('name').equals(params.name);
    }
    if(params.realname){
        query.where('realname').equals(params.realname);
    }
    if(params.phone){
        query.where('phone').equals(params.phone);
    }
    if(params.password){
        query.where('password').equals(params.password);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.gender){
        query.where('gender').equals(params.gender);
    }
    if(params.type){
        query.where('type').equals(params.type);
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
    let adminUserObj = bodyParams;

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
}
const updateAdminUserInfo = (req, res, next) => {
    let bodyParams = req.body;

    let query = AdminUserModel.find({});
    let params = req.params;
    if(params.adminUserId){
        if(params.adminUserId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.adminUserId));
        }else{
            return resUtil.resetFailedRes(res, systemMsg.SYS_OBJECT_ID_ERROR);
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
const deleteAdminUserInfo = (req, res, next) => {
    let query = AdminUserModel.find({});
    let params = req.params;
    if(params.adminUserId){
        if(params.adminUserId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.adminUserId));
        }else{
            return resUtil.resetFailedRes(res, systemMsg.SYS_OBJECT_ID_ERROR);
        }
    }

    AdminUserModel.deleteOne(query,function(error,result){
        if (error) {
            logger.error(' deleteAdminUserInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' deleteAdminUserInfo ' + 'success');
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    })
}
const adminUserLogin = (req, res, next) => {
    let bodyParams = req.body;

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
                        resolve(rows[0]);
                    } else {
                        logger.warn(' adminUserLogin username or password' + 'not verified!');
                        reject({msg:' adminUserLogin username or password not verified!'});
                    }

                }
            });
        });
    }

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
                    return next(sysError.InternalError(error.message,sysMsg.InvalidArgument))
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
            // resUtil.resetFailedRes(res, reject.msg);
            if(reject.err) {
                resUtil.resetFailedRes(res, reject.err);
            }else{
                resUtil.resetFailedRes(res, systemMsg.CUST_LOGIN_USER_PSWD_ERROR);
            }
        })

}
module.exports = {
    getAdminUser,
    createAdminUser,
    updateAdminUserInfo,
    deleteAdminUserInfo,
    adminUserLogin
};