"use strict"

const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('AdminUserController');

const {AdminUserModel} = require('../modules');


const getAdminUser = (req, res, next) => {
    let params = req.query;
    let query = AdminUserModel.find({},{password:0});

    if(params.adminUserId){
        query.where('_id').equals(params.adminUserId);
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
        }
    });
}

const  createAdminUser = (req, res, next) => {
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
        }
    })
}


const  updateAdminUserInfo = (req, res, next) => {
    let bodyParams = req.body;

    let query = AdminUserModel.find({});
    let params = req.params;
    if(params.adminUserId){
        query.where('_id').equals(params.adminUserId);
    }

    AdminUserModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAdminUserInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAdminUserInfo ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const  deleteAdminUserInfo = (req, res, next) => {
    let query = AdminUserModel.find({});
    let params = req.params;
    if(params.adminUserId){
        query.where('_id').equals(params.adminUserId);
    }

    AdminUserModel.deleteOne(query,function(error,result){
        if (error) {
            logger.error(' deleteAdminUserInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' deleteAdminUserInfo ' + 'success');
            console.log('rows:',result);
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getAdminUser,
    createAdminUser,
    updateAdminUserInfo,
    deleteAdminUserInfo
};