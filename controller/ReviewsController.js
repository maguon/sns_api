"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('ReviewsController');

const {ReviewsModel} = require('../modules');
const {MessageModel} = require('../modules');

const getUserReviews = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = ReviewsModel.find({status:sysConsts.INFO_STATUS.Status.available,del_status:sysConsts.DEL_STATIS.Status.not_deleted});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserReviews  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserReviews  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.reviewsId){
        if(path.reviewsId.length == 24){
            query.where('_Id').equals(mongoose.mongo.ObjectId(path.reviewsId));
        }else{
            logger.info('getUserReviews  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.reviewsMsg){
        query.where('reviewsMsg').equals(params.reviewsMsg);
    }
    if(params.reviewsNum){
        query.where('reviewsNum').equals(params.reviewsNum);
    }
    if(params.agreeNum){
        query.where('agreeNum').equals(params.agreeNum);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserReviews ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserReviews ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllReviews = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = ReviewsModel.find({status:sysConsts.INFO_STATUS.Status.available,del_status:sysConsts.DEL_STATIS.Status.not_deleted});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllReviews  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.reviewsId){
        if(path.reviewsId.length == 24){
            query.where('_Id').equals(mongoose.mongo.ObjectId(path.reviewsId));
        }else{
            logger.info('getAllReviews  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.reviewsMsg){
        query.where('reviewsMsg').equals(params.reviewsMsg);
    }
    if(params.reviewsNum){
        query.where('reviewsNum').equals(params.reviewsNum);
    }
    if(params.agreeNum){
        query.where('agreeNum').equals(params.agreeNum);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAllReviews ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllReviews ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createReviews = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let reviewsObj = bodyParams;

    let query = MessageModel.find({del_status:sysConsts.DEL_STATIS.Status.not_deleted},{commentNum: 1});
    let commentNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            reviewsObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createReviews  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            reviewsObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('createReviews  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    const saveReviews = ()=>{
        return new Promise(((resolve, reject) => {
            let reviewsModel = new ReviewsModel(reviewsObj);
            reviewsModel.save(function(error,result){
                if (error) {
                    logger.error(' createReviews saveReviews ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createReviews saveReviews ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getCommentNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createReviews getCommentNum ' + error.message);
                    reject(error);
                } else {
                    commentNum = Number(rows[0]._doc.commentNum);
                    logger.info(' createReviews getCommentNum ' + 'success');
                    resolve(resultInfo);
                }
            });
        }));
    }
    const updateCommentNum = (resultInfo) =>{
        return new Promise((() => {
            MessageModel.updateOne(query,{ commentNum: commentNum +1},function(error,result){
                if (error) {
                    logger.error(' createReviews updateCommentNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createReviews updateCommentNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveReviews()
        .then(getCommentNum)
        .then(updateCommentNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const deleteReviews = (req, res, next) => {
    let params = req.params;
    let query = ReviewsModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('deleteReviews  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.reviewsId){
        if(params.reviewsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.reviewsId));
        }else{
            logger.info('deleteReviews  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWS_ID_NULL_ERROR);
            return next();
        }
    }
    ReviewsModel.updateOne(query,{del_status:sysConsts.DEL_STATIS.Status.delete},function(error,result){
        if (error) {
            logger.error(' deleteReviews ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' deleteReviews ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserReviews,
    getAllReviews,
    createReviews,
    deleteReviews
};