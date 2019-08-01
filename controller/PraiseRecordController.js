"use strict"

const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('UserController');

const {PraiseRecordModel} = require('../modules');

const getPraiseRecord = (req, res, next) => {
    let params = req.query;
    let query = UserModel.find({},{password:0});

    if(params.userId){
        query.where('_id').equals(params.userId);
    }
    if(params.userDetailId){
        query.where('_userDetailId').equals(params.userDetailId);
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
    if(params.auth_status){
        query.where('auth_status').equals(params.auth_status);
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.last_login_on){
        query.where('last_login_on').equals(params.last_login_on);
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
const createPraiseRecord = (req, res, next) => {
    let bodyParams = req.body;
    let userObj = bodyParams;
    let userId;

    if(bodyParams.password){
        console.log(bodyParams.password);
        bodyParams.password = encrypt.encryptByMd5NoKey(bodyParams.password);
    }

    const createUserInfo = () =>{
        return new Promise(((resolve, reject) => {
            let userModel = new UserModel(userObj);
            userModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserInfo ' + error.message);
                    reject({err:error});
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
            userDetailModel.save(function(error,result){
                if (error) {
                    logger.error(' createUser createUserDetail ' + error.message);
                    reject({err:error});
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
const deletePraiseRecord = (req, res, next) => {
    let userId;

    const deleteUser = () =>{
        return new Promise((resolve, reject)=> {
            let query = UserModel.find({});
            let params = req.params;

            if(params.userId){
                userId = params.userId;
                query.where('_id').equals(params.userId);
            }

            UserModel.deleteOne(query,function(error,result){
                if (error) {
                    logger.error(' deleteUserInfo deleteUser ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' deleteUserInfo deleteUser ' + 'success');
                    resolve();
                }
            })
        });
    }

    const deleteUserDetail = () => {
        return new Promise((resolve, reject) => {
            let query = UserDetailModel.find({});

            if(userId){
                query.where('_userId').equals(userId);
            }

            UserDetailModel.deleteOne(query,function(error,result){
                if (error) {
                    logger.error(' deleteUserInfo deleteUserDetail ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' deleteUserInfo deleteUserDetail ' + 'success');
                    resUtil.resetQueryRes(res,result,null);
                    return next();
                }
            })
        });
    }

    deleteUser()
        .then(deleteUserDetail)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,systemMsg.USER_DELETE_INFO);
            }
        })

}
module.exports = {
    getPraiseRecord,
    createPraiseRecord,
    deletePraiseRecord,
};