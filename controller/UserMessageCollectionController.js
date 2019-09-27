"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserMessageCollectionsController');

const {UserMessageCollectionsModel} = require('../modules');

const getUserMessageCollections = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = UserMessageCollectionsModel.find({status:sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMessageCollections  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userMessageCollectionsId){
        if(params.userMessageCollectionsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userMessageCollectionsId));
        }else{
            logger.info('getUserMessageCollections  userMessageCollectionsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_COLLECTIONS_ID_NULL);
            return next();
        }
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserMessageCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMessageCollections ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserMessageCollections = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userMessageCollectionsObj = bodyParams;
    userMessageCollectionsObj.status = sysConsts.INFO_STATUS.Status.available;
    if(path.userId){
        if(path.userId.length == 24){
            userMessageCollectionsObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createUserMessageCollections  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            userMessageCollectionsObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
        }else{
            logger.info('createUserMessageCollections  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    let userMessageCollectionsModel = new UserMessageCollectionsModel(userMessageCollectionsObj);
    userMessageCollectionsModel.save(function(error,result){
        if (error) {
            logger.error(' createUserMessageCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createUserMessageCollections ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = UserMessageCollectionsModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userMessageCollectionId){
        if(params.userMessageCollectionId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userMessageCollectionId));
        }else{
            logger.info('updateStatus  userMessageCollectionId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    UserMessageCollectionsModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatus ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserMessageCollections,
    createUserMessageCollections,
    updateStatus
};