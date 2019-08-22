"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessagePraiseController');

const {MessagePraiseModel} = require('../modules');
const {MessageModel} = require('../modules');

const getMessagePraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessagePraiseModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getMessagePraise  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getMessagePraise  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseId){
        if(params.praiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseId));
        }else{
            logger.info('updateReadStatus  praiseId format incorrect!');
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
            logger.error(' getMessagePraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMessagePraise ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createMessagePraise = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let messagePraiseObj = bodyParams;

    let query = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            messagePraiseObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createMessagePraise userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            messagePraiseObj._messageId = mongoose.mongo.ObjectId(params.messagesId);
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('createMessagePraise  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    const savePraise = ()=>{
        return new Promise((resolve, reject) => {
            let messagePraiseModel = new MessagePraiseModel(messagePraiseObj);
            messagePraiseModel.save(function(error,result){
                if (error) {
                    logger.error(' createMessagePraise savePraise ' + error.message);
                    reject({err:reject.error});
                } else {
                    logger.info(' createMessagePraise savePraise ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const getAgreeNum = (resultInfo)=>{
        return new Promise((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessagePraise getAgreeNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        agreeNum = Number(rows[0]._doc.agreeNum);
                        logger.info(' createMessagePraise getAgreeNum ' + 'success');
                        resolve(resultInfo);
                    }else{
                        reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateAgreeNum = (resultInfo)=>{
        return new Promise(() => {
            MessageModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                if (error) {
                    logger.error(' createMessagePraise updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createMessagePraise updateAgreeNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        });
    }
    savePraise()
        .then(getAgreeNum)
        .then(updateAgreeNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const updateReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = MessagePraiseModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseId){
        if(params.praiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseId));
        }else{
            logger.info('updateReadStatus  praiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    MessagePraiseModel.updateOne(query,bodyParams,function(error,result){
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
const updateStatusByUser = (req, res, next) => {
    let params = req.params;
    let query = MessagePraiseModel.find({});

    let queryMessage = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatusByUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseId){
        if(params.praiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseId));
        }else{
            logger.info('updateStatusByUser  praiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    const getAgreeNum = ()=>{
        return new Promise((resolve, reject) => {
            query.populate({path:'_messageId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateStatusByUser getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        agreeNum = rows[0]._doc._messageId._doc.agreeNum;
                        if(agreeNum){
                            agreeNum = agreeNum -1;
                        }
                        queryMessage.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._messageId._id));
                        logger.info(' updateStatusByUser getCommentsNum _messageId:' + rows[0]._doc._messageId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateMessagePraise =()=>{
        return new Promise((resolve, reject) => {
            MessagePraiseModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateStatus ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' updateStatus ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const updateAgreeNum = (resultInfo)=>{
        return new Promise(() => {
            MessageModel.updateOne(queryMessage,{ agreeNum: agreeNum},function(error,result){
                if (error) {
                    logger.error(' updateStatusByUser updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateStatusByUser updateAgreeNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        });
    }
    getAgreeNum()
        .then(updateMessagePraise)
        .then(updateAgreeNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateStatus = (req, res, next) => {
    let params = req.params;
    let query = MessagePraiseModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseId){
        if(params.praiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseId));
        }else{
            logger.info('updateStatus  praiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    MessagePraiseModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getMessagePraise,
    createMessagePraise,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};