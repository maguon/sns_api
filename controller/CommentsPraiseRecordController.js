"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsPraiseRecordController');

const {CommentsPraiseRecordModel} = require('../modules');

const getCommentsPraiseRecord = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsPraiseRecordModel.find();

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getCommentsPraiseRecord  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getCommentsPraiseRecord  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
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
            logger.error(' getCommentsPraiseRecord ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getCommentsPraiseRecord ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsPraiseRecord = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let commentsPraiseRecordObj = bodyParams;

    if(params.userId){
        if(params.userId.length == 24){
            commentsPraiseRecordObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createCommentsPraiseRecord userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            commentsPraiseRecordObj._messageId = mongoose.mongo.ObjectId(params.messagesId);
        }else{
            logger.info('createCommentsPraiseRecord  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    let commentsPraiseRecordModel = new CommentsPraiseRecordModel(commentsPraiseRecordObj);
    commentsPraiseRecordModel.save(function(error,result){
        if (error) {
            logger.error(' createCommentsPraiseRecord ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createCommentsPraiseRecord ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
module.exports = {
    getCommentsPraiseRecord,
    createCommentsPraiseRecord
};