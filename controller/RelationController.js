"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('RelationController');

const {RelationModel} = require('../modules');

const getFollow = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = RelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollow userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.relationId){
        if(params.relationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        }else{
            logger.info('getFollow relationId format incorrect!');
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
    let query = RelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollowUserInfo userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.relationId){
        if(params.relationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        }else{
            logger.info('getFollowUserInfo relationId format incorrect!');
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
    let query = RelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttention userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.relationId){
        if(params.relationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        }else{
            logger.info('getAttention relationId format incorrect!');
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
    let query = RelationModel.find({status : sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttentionUserInfo userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.relationId){
        if(params.relationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        }else{
            logger.info('getAttentionUserInfo relationId format incorrect!');
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
const createRelation = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let relationObj = bodyParams;
    relationObj.status = sysConsts.INFO_STATUS.Status.available;
    if(params.userId){
        if(params.userId.length == 24){
            relationObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createRelation userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let relationModel = new RelationModel(relationObj);
    relationModel.save(function(error,result){
        if (error) {
            logger.error(' createRelation ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createRelation ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateRelationStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = RelationModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateRelationStatus userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.relationId) {
        if (params.relationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        } else {
            logger.info('updateRelationStatus relationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    RelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateRelationStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateRelationStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateRelationStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let query = RelationModel.find({});
    let params = req.params;
    if(params.relationId) {
        if (params.relationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        } else {
            logger.info('updateRelationStatusByAdmin relationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    RelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateRelationStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateRelationStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateRelationReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = RelationModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateRelationReadStatus userById format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.relationId) {
        if (params.relationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        } else {
            logger.info('updateRelationReadStatus relationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    RelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateRelationReadStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateRelationReadStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateRelationReadStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let query = RelationModel.find({});
    let params = req.params;
    if(params.relationId) {
        if (params.relationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.relationId));
        } else {
            logger.info('updateRelationReadStatusByAdmin relationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    RelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateRelationReadStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateRelationReadStatusByAdmin ' + 'success');
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
    createRelation,
    updateRelationStatus,
    updateRelationStatusByAdmin,
    updateRelationReadStatus,
    updateRelationReadStatusByAdmin,
};