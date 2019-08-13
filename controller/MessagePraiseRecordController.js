"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessagePraiseRecordController');

const {MessagePraiseRecordModel} = require('../modules');

const getMessagePraiseRecord = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessagePraiseRecordModel.find();

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getMessagePraiseRecord  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getMessagePraiseRecord  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
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
            logger.error(' getMessagePraiseRecord ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMessagePraiseRecord ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createMessagePraiseRecord = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let messagePraiseRecordObj = bodyParams;

    if(params.userId){
        if(params.userId.length == 24){
            messagePraiseRecordObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createPraiseRecord userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            messagePraiseRecordObj._messageId = mongoose.mongo.ObjectId(params.messagesId);
        }else{
            logger.info('createPraiseRecord  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    let messagePraiseRecordModel = new MessagePraiseRecordModel(messagePraiseRecordObj);
    messagePraiseRecordModel.save(function(error,result){
        if (error) {
            logger.error(' createMessagePraiseRecord ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createMessagePraiseRecord ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
module.exports = {
    getMessagePraiseRecord,
    createMessagePraiseRecord
};