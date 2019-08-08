"use strict"
const mongoose = require('mongoose');
const systemMsg = require('../util/SystemMsg');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserDetailController');

const {UserDetailModel} = require('../modules');

const getUserDetail = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserDetailModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserDetail  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userDetailId){
        if(params.userDetailId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userDetailId));
        }else{
            logger.info('getUserDetail  userDetailID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.USER_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.sex){
        query.where('sex').equals(params.sex);
    }
    if(params.birthday){
        query.where('birthday').equals(params.birthday);
    }
    if(params.realmname){
        query.where('realmname').equals(params.realmname);
    }
    if(params.intro){
        query.where('intro').equals(params.intro);
    }
    if(params.label){
        query.where('label').equals(params.label);
    }
    if(params.truename){
        query.where('truename').equals(params.truename);
    }
    if(params.avatar){
        query.where('avatar').equals(params.avatar);
    }
    if(params.drivingtype){
        query.where('drivingtype').equals(params.drivingtype);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserDetail ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserDetail ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const updateUserDetailInfo = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDetailModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserDetailInfo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userDetailId){
        if(params.userDetailId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userDetailId));
        }else{
            logger.info('updateUserDetailInfo  userDetailID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.USER_ID_NULL_ERROR);
            return next();
        }
    }
    UserDetailModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserDetailInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserDetailInfo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateAccordingToUserID = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDetailModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateAccordingToUserID  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    UserDetailModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAccordingToUserID ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAccordingToUserID ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}

module.exports = {
    getUserDetail,
    updateUserDetailInfo,
    updateAccordingToUserID
};