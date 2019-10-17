"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('SystemMessageController');

const {SystemMessageModel} = require('../modules');

const getSystemMessage = (req, res, next) => {
    let params = req.query;
    let query = SystemMessageModel.find({});
    if(params.publisherId){
        if(params.publisherId.length == 24){
            query.where('_adminId').equals(mongoose.mongo.ObjectId(params.publisherId));
        }else{
            logger.info('getVote publisherId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.systemMessageId){
        if(params.systemMessageId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.vsystemMessageIdoteId));
        }else{
            logger.info('getVote voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYSTEM_MESSAGE_ID_NULL_ERROR);
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
            logger.error(' getVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getVote ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createSystemMessage = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let systemMessageObj = bodyParams;
    if(params.adminId){
        if(params.adminId.length == 24){
            systemMessageObj._adminId = mongoose.mongo.ObjectId(params.adminId);
        }else{
            logger.info('createSystemMessage adminId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let systemMessageModel = new SystemMessageModel(systemMessageObj);
    systemMessageModel.save(function(error,result){
        if (error) {
            logger.error(' createSystemMessage ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createSystemMessage ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}

module.exports = {
    getSystemMessage,
    createSystemMessage
};