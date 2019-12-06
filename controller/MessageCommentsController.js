"use strict"
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessageCommentsController');

const {MessageCommentsModel} = require('../modules');
const {MessageModel} = require('../modules');

const getUserMessageComments = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessageCommentsModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMessageComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getUserMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getUserMessageComments  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserMessageComments ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMessageComments ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllMessageComments = (req, res, next) => {
    let params = req.query;
    let query = MessageCommentsModel.find({});
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getAllMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getAllMessageComments  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAllMessageComments ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllMessageComments ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createMessageComments = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let returnMessage;

    //保存数据
    const saveMessageComments = ()=>{
        return new Promise((resolve, reject) => {
            let messageCommentsObj = bodyParams;
            messageCommentsObj.read_status = sysConsts.INFO.read_status.unread;
            messageCommentsObj.commentsNum = 0;
            messageCommentsObj.agreeNum = 0;
            if(params.userId){
                if(params.userId.length == 24){
                    messageCommentsObj._userId = mongoose.mongo.ObjectId(params.userId);
                }else{
                    logger.info('createMessageComments userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            let messageCommentsModel = new MessageCommentsModel(messageCommentsObj);
            messageCommentsModel.save(function(error,result){
                if (error) {
                    logger.error(' createMessageComments saveMessageComments ' + error.message);
                    reject({err:error.message});
                    // resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMessageComments saveMessageComments ' + 'success');
                    returnMessage = result;
                    resolve();
                    // resUtil.resetCreateRes(res, result);
                    // return next();
                }
            });
        });
    }
    const updateMessageNum = () =>{
        return new Promise(() => {
            let query = MessageModel.find({});
            if(bodyParams._messageId){
                if(bodyParams._messageId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageId));
                }else{
                    logger.info('createMessageComments updateMessageNum _messageId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageModel.findOneAndUpdate(query,{ $inc: { commentsNum: 1 } },).exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessageComments updateMessageNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMessageComments updateMessageNum ' + 'success');
                    resUtil.resetQueryRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    const updateMessageCommentsNum = () =>{
        return new Promise((() => {
            let query = MessageCommentsModel.find({});
            if(bodyParams._messageCommentsId){
                if(bodyParams._messageCommentsId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageCommentsId));
                }else{
                    logger.info('createMessageComments updateMessageCommentsNum _messageCommentsId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageCommentsModel.findOneAndUpdate(query,{ $inc: { commentsNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessageComments updateMessageCommentsNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMessageComments updateMessageCommentsNum ' + 'success');
                    resUtil.resetQueryRes(res, returnMessage);
                    return next();
                }
            });
        }));
    }
    saveMessageComments()
        .then(()=>{
            if(bodyParams.type == sysConsts.COUMMENT.type.firstCoumment){
                //一级评论
                updateMessageNum();
            }else{
                //二级评论
                updateMessageCommentsNum();
            }
        })
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = MessageCommentsModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('updateReadStatus  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsModel.updateOne(query,bodyParams,function(error,result){
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
const getMessageCommentsByAdmin = (req, res, next) => {
    let params = req.query;
    let query = MessageCommentsModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getMessageCommentsByAdmin  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getMessageCommentsByAdmin  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getMessageCommentsByAdmin  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getMessageCommentsByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMessageCommentsByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
module.exports = {
    getUserMessageComments,
    getAllMessageComments,
    createMessageComments,
    updateReadStatus,
    getMessageCommentsByAdmin
};