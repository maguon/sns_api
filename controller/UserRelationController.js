"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserRelationController');

const {UserRelationModel} = require('../modules');

const getFollow = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserRelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollow userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getFollow userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getFollow ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFollow ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getFollowUserInfo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserRelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollowUserInfo userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getFollowUserInfo userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.populate({path:'_userId'}).exec((error,rows)=> {
        if (error) {
            logger.error(' getFollowUserInfo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFollowUserInfo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAttention = (req, res, next) => {
    let path = req.params;
    let params = req.params;
    let query = UserRelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttention userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getAttention userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.groupName){
        query.where('groupName').equals(params.groupName);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAttention ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAttention ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAttentionUserInfo = (req, res, next) => {
    let path = req.params;
    let params = req.params;
    let query = UserRelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttentionUserInfo userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getAttentionUserInfo userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.groupName){
        query.where('groupName').equals(params.groupName);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.populate({path:'_userById'}).exec((error,rows)=> {
        if (error) {
            logger.error(' getAttentionUserInfo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAttentionUserInfo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserRelation = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let userRelationObj = bodyParams;
    userRelationObj.status = sysConsts.INFO_STATUS.Status.available;
    if(params.userId){
        if(params.userId.length == 24){
            userRelationObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createUserRelation userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let userRelationModel = new UserRelationModel(userRelationObj);
    userRelationModel.save(function(error,result){
        if (error) {
            logger.error(' createUserRelation ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createUserRelation ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateUserRelationStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserRelationModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserRelationStatus userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId) {
        if (params.userRelationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        } else {
            logger.info('updateUserRelationStatus userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    UserRelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserRelationStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserRelationStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateUserRelationStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserRelationModel.find({});
    let params = req.params;
    if(params.userRelationId) {
        if (params.userRelationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        } else {
            logger.info('updateUserRelationStatusByAdmin userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    UserRelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserRelationStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserRelationStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateUserRelationReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserRelationModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserRelationReadStatus userById format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId) {
        if (params.userRelationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        } else {
            logger.info('updateUserRelationReadStatus userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    UserRelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserRelationReadStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserRelationReadStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateUserRelationReadStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserRelationModel.find({});
    let params = req.params;
    if(params.userRelationId) {
        if (params.userRelationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        } else {
            logger.info('updateUserRelationReadStatusByAdmin userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    UserRelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserRelationReadStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserRelationReadStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getFollow,
    getFollowUserInfo,
    getAttention,
    getAttentionUserInfo,
    createUserRelation,
    updateUserRelationStatus,
    updateUserRelationStatusByAdmin,
    updateUserRelationReadStatus,
    updateUserRelationReadStatusByAdmin,
};