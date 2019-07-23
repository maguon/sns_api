"use strict"

const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserController');

const {UserModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUser = (req, res, next) => {
    let params = req.query;
    let query = UserModel.find({},{password:0});

    if(params.userId){
        query.where('_id').equals(params.userId);
    }
    if(params.phone){
        query.where('phone').equals(params.phone);
    }
    if(params.password){
        query.where('password').equals(params.password);
    }
    if(params.nikename){
        query.where('nikename').equals(params.nikename);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }

    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
        }
    });
}

const  createUser = (req, res, next) => {
    let bodyParams = req.body;
    let userObj = bodyParams;

    if(bodyParams.password){
        console.log(bodyParams.password);
        bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
    }

    let userModel = new UserModel(userObj);
    userModel.save(function(error,result){
        if (error) {
            logger.error(' createUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createUser ' + 'success');
            if (result._doc) {
                console.log('_doc._id:',result._doc._id);
                let userDetailModel = new UserDetailModel(userObj);
                userDetailModel._userId = result._doc._id;//将新创建的用户ID，添加到新建的用户详细信息中
                userDetailModel.save(); // 很重要 不save则没有数据
            }
            resUtil.resetCreateRes(res, result);
        }
    })
}


const  updateUserInfo = (req, res, next) => {
    let bodyParams = req.body;

    let query = UserModel.find({});
    let params = req.params;
    if(params.userId){
        query.where('_id').equals(params.userId);
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
const  deleteUserInfo = (req, res, next) => {
    let query = UserModel.find({});
    let params = req.params;
    if(params.userId){
        query.where('_id').equals(params.userId);
    }

    UserModel.deleteOne(query,function(error,result){
        if (error) {
            logger.error(' deleteUserInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' deleteUserInfo ' + 'success');
            console.log('rows:',result);
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUser,
    createUser,
    updateUserInfo,
    deleteUserInfo
};