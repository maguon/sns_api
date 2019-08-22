"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsPraiseController');

const {CommentsPraiseModel} = require('../modules');
const {CommentsModel} = require('../modules');

const getCommentsPraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsPraiseModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getCommentsPraise  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('getCommentsPraise  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
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
            logger.error(' getCommentsPraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getCommentsPraise ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsPraise = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let commentsPraiseObj = bodyParams;

    let query = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            commentsPraiseObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createCommentsPraise userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            commentsPraiseObj._commentsId = mongoose.mongo.ObjectId(params.commentsId);
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('createCommentsPraise  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    const savePraise =()=>{
        return new Promise((resolve, reject) => {
            let commentsPraiseModel = new CommentsPraiseModel(commentsPraiseObj);
            commentsPraiseModel.save(function(error,result){
                if (error) {
                    logger.error(' createCommentsPraise savePraise ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createCommentsPraise savePraise ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const getAgreeNum = (resultInfo)=>{
        return new Promise((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createCommentsPraise getAgreeNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        agreeNum = Number(rows[0]._doc.agreeNum);
                        logger.info(' createCommentsPraise getAgreeNum ' + 'success');
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
                    logger.error(' createCommentsPraise updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createCommentsPraise updateAgreeNum ' + 'success');
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
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = CommentsPraiseModel.find({status:sysConsts.INFO_STATUS.Status.available});

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
    CommentsPraiseModel.updateOne(query,bodyParams,function(error,result){
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
    let query = CommentsPraiseModel.find({});

    let queryComments = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
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
            query.populate({path:'_commentsId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateStatusByUser getAgreeNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        agreeNum = rows[0]._doc._commentsId._doc.agreeNum;
                        if(agreeNum){
                            agreeNum = agreeNum -1;
                        }
                        queryComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsId._id));
                        logger.info(' updateStatusByUser getAgreeNum _commentsId:' + rows[0]._doc._commentsId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateCommentsPraise =()=>{
        return new Promise((resolve, reject) =>{
            CommentsPraiseModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateStatusByUser updateCommentsPraise ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' updateStatusByUser updateCommentsPraise ' + 'success');
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
        .then(updateCommentsPraise)
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
    let query = CommentsPraiseModel.find({});
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
    CommentsPraiseModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getCommentsPraise,
    createCommentsPraise,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};