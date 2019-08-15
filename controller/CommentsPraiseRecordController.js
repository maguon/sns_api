"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsPraiseRecordController');

const {CommentsPraiseRecordModel} = require('../modules');
const {CommentsModel} = require('../modules');

const getCommentsPraiseRecord = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsPraiseRecordModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getCommentsPraiseRecord  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('getCommentsPraiseRecord  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
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

    let query = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            commentsPraiseRecordObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createCommentsPraiseRecord userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            commentsPraiseRecordObj._commentsId = mongoose.mongo.ObjectId(params.commentsId);
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('createCommentsPraiseRecord  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    const savePraiseRecord =()=>{
        return new Promise((resolve, reject) => {
            let commentsPraiseRecordModel = new CommentsPraiseRecordModel(commentsPraiseRecordObj);
            commentsPraiseRecordModel.save(function(error,result){
                if (error) {
                    logger.error(' createCommentsPraiseRecord savePraiseRecord ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createCommentsPraiseRecord savePraiseRecord ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const getAgreeNum = (resultInfo)=>{
        return new Promise((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createCommentsPraiseRecord getAgreeNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        agreeNum = Number(rows[0]._doc.agreeNum);
                        logger.info(' createCommentsPraiseRecord getAgreeNum ' + 'success');
                        resolve(resultInfo);
                    }else{
                        reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateAgreeNum = (resultInfo)=>{
        return new Promise(() => {
            CommentsModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                if (error) {
                    logger.error(' createCommentsPraiseRecord updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createCommentsPraiseRecord updateAgreeNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        });
    }
    savePraiseRecord()
        .then(getAgreeNum)
        .then(updateAgreeNum)
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
    let query = CommentsPraiseRecordModel.find({status:sysConsts.INFO_STATUS.Status.available});

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
    CommentsPraiseRecordModel.updateOne(query,bodyParams,function(error,result){
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
    let query = CommentsPraiseRecordModel.find({});

    let queryComments = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

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
    const getAgreeNum = ()=>{
        return new Promise((resolve, reject) => {
            query.populate({path:'_commentsId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateStatusByUser getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        agreeNum = rows[0]._doc._commentsId._doc.agreeNum;
                        if(agreeNum){
                            agreeNum = agreeNum -1;
                        }
                        queryComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsId._id));
                        logger.info(' updateStatusByUser getCommentsNum _messageId:' + rows[0]._doc._commentsId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateCommentsPraiseRecord =()=>{
        return new Promise((resolve, reject) =>{
            CommentsPraiseRecordModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
            CommentsModel.updateOne(queryComments,{ agreeNum: agreeNum},function(error,result){
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
        .then(updateCommentsPraiseRecord)
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
    let query = CommentsPraiseRecordModel.find({});
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
    CommentsPraiseRecordModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getCommentsPraiseRecord,
    createCommentsPraiseRecord,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};