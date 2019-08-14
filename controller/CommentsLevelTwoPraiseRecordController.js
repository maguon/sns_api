"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsLevelTwoPraiseRecordController');

const {CommentsLevelTwoPraiseRecordModel} = require('../modules');

const getCommentsLevelTwoPraiseRecord = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsLevelTwoPraiseRecordModel.find();

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserCommentsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsLevelTwoId){
        if(path.commentsLevelTwoId.length == 24){
            query.where('_commentsLevelTwoId').equals(mongoose.mongo.ObjectId(path.commentsLevelTwoId));
        }else{
            logger.info('getUserCommentsLevelTwo  commentsLevelTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateReadStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
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
            logger.error(' getUserCommentsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserCommentsLevelTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsLevelTwoPraiseRecord = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let commentsLevelTwoPraiseRecordObj = bodyParams;

    if(params.userId){
        if(params.userId.length == 24){
            commentsLevelTwoPraiseRecordObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createCommentsLevelTwoPraiseRecord userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            commentsLevelTwoPraiseRecordObj._messageId = mongoose.mongo.ObjectId(params.messagesId);
        }else{
            logger.info('createCommentsLevelTwoPraiseRecord  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    let commentsLevelTwoPraiseRecordModel = new CommentsLevelTwoPraiseRecordModel(commentsLevelTwoPraiseRecordObj);
    commentsLevelTwoPraiseRecordModel.save(function(error,result){
        if (error) {
            logger.error(' createCommentsLevelTwoPraiseRecord ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createCommentsLevelTwoPraiseRecord ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = CommentsLevelTwoPraiseRecordModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateReadStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsLevelTwoPraiseRecordModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateReadStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateReadStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateStatus = (req, res, next) => {
    let params = req.params;
    let query = CommentsLevelTwoPraiseRecordModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsLevelTwoPraiseRecordModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getCommentsLevelTwoPraiseRecord,
    createCommentsLevelTwoPraiseRecord,
    updateReadStatus,
    updateStatus
};