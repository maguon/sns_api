"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsTwoPraiseController');

const {CommentsTwoPraiseModel} = require('../modules');
const {CommentsTwoModel} = require('../modules');

const getCommentsTwoPraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsTwoPraiseModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId){
        if(params.commentsTwoId.length == 24){
            query.where('_commentsTwoId').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('getUserCommentsTwo  commentsTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
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
            logger.error(' getUserCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserCommentsTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsTwoPraise = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let commentsTwoPraiseObj = bodyParams;

    let query = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            commentsTwoPraiseObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createCommentsTwoPraise userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId){
        if(params.commentsTwoId.length == 24){
            commentsTwoPraiseObj._commentsTwoId = mongoose.mongo.ObjectId(params.commentsTwoId);
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('createCommentsTwoPraise  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }

    const savePraise = ()=>{
        return new Promise((resolve,reject)=>{
            let commentsTwoPraiseModel = new CommentsTwoPraiseModel(commentsTwoPraiseObj);
            commentsTwoPraiseModel.save(function(error,result){
                if (error) {
                    logger.error(' createCommentsTwoPraise savePraise ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createCommentsTwoPraise savePraise ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const getAgreeNum = (resultInfo)=>{
        return new Promise((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createCommentsTwoPraise getAgreeNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        agreeNum = Number(rows[0]._doc.agreeNum);
                        logger.info(' createCommentsTwoPraise getAgreeNum ' + 'success');
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
            CommentsTwoModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                if (error) {
                    logger.error(' createCommentsTwoPraise updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createCommentsTwoPraise updateAgreeNum ' + 'success');
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
    let query = CommentsTwoPraiseModel.find({});

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
    CommentsTwoPraiseModel.updateOne(query,bodyParams,function(error,result){
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
    let query = CommentsTwoPraiseModel.find({});

    let queryCommentsTwo = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
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
    if(params.praiseId){
        if(params.praiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseId));
        }else{
            logger.info('updateStatus  praiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    const getAgreeNum = ()=>{
        return new Promise((resolve, reject) => {
            query.populate({path:'_commentsTwoId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateStatusByUser getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        agreeNum = rows[0]._doc._commentsTwoId._doc.agreeNum;
                        if(agreeNum){
                            agreeNum = agreeNum -1;
                        }
                        queryCommentsTwo.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsTwoId._id));
                        logger.info(' updateStatusByUser getCommentsNum _messageId:' + rows[0]._doc._commentsTwoId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.COMMENTSTWO_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateCommentsPraise =()=>{
        return new Promise((resolve, reject) =>{
            CommentsTwoPraiseModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
            CommentsTwoModel.updateOne(queryCommentsTwo,{ agreeNum: agreeNum},function(error,result){
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
    let query = CommentsTwoPraiseModel.find({});
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
    CommentsTwoPraiseModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getCommentsTwoPraise,
    createCommentsTwoPraise,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};