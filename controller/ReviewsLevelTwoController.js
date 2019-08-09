"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('ReviewsLevelTwoController');

const {ReviewsLevelTwoModel} = require('../modules');
const {ReviewsModel} = require('../modules');

const getUserReviewsLevelTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = ReviewsLevelTwoModel.find({status:sysConsts.INFO_STATUS.Status.available,del_status:sysConsts.DEL_STATIS.Status.not_deleted});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserReviewsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserReviewsLevelTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.reviewsId){
        if(path.reviewsId.length == 24){
            query.where('_reviewsId').equals(mongoose.mongo.ObjectId(path.reviewsId));
        }else{
            logger.info('getUserReviewsLevelTwo  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.reviewsLevelTwoMsg){
        query.where('reviewsLevelTwoMsg').equals(params.reviewsLevelTwoMsg);
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
            logger.error(' getUserReviewsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserReviewsLevelTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllReviewsLevelTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = ReviewsLevelTwoModel.find({status:sysConsts.INFO_STATUS.Status.available,del_status:sysConsts.DEL_STATIS.Status.not_deleted});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllReviewsLevelTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.reviewsId){
        if(path.reviewsId.length == 24){
            query.where('_reviewsId').equals(mongoose.mongo.ObjectId(path.reviewsId));
        }else{
            logger.info('getAllReviewsLevelTwo  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.reviewsLevelTwoMsg){
        query.where('reviewsLevelTwoMsg').equals(params.reviewsLevelTwoMsg);
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
            logger.error(' getAllReviewsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllReviewsLevelTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createReviewsLevelTwo = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let reviewsLevelTwoModelObj = bodyParams;

    let query = ReviewsModel.find({del_status:sysConsts.DEL_STATIS.Status.not_deleted});
    let reviewsNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            reviewsLevelTwoModelObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createReviewsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            reviewsLevelTwoModelObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
        }else{
            logger.info('createReviewsLevelTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.reviewsId){
        if(path.reviewsId.length == 24){
            reviewsLevelTwoModelObj._reviewsId = mongoose.mongo.ObjectId(path.reviewsId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.reviewsId));
        }else{
            logger.info('createReviewsLevelTwo  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const saveReviewsLevelTwo = ()=>{
        return new Promise(((resolve, reject) => {
            let reviewsLevelTwoModel = new ReviewsLevelTwoModel(reviewsLevelTwoModelObj);
            reviewsLevelTwoModel.save(function(error,result){
                if (error) {
                    logger.error(' createReviewsLevelTwo saveReviewsLevelTwo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createReviewsLevelTwo saveReviewsLevelTwo ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getReviewsNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createReviewsLevelTwo getReviewsNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length>0){
                        reviewsNum = Number(rows[0]._doc.reviewsNum);
                        logger.info(' createReviewsLevelTwo getReviewsNum ' + 'success');
                        resolve(resultInfo);
                    }else{
                        reject({msg:systemMsg.REVIEWS_ID_NULL_ERROR});
                    }
                }
            });
        }));
    }
    const updateReviewsNum = (resultInfo) =>{
        return new Promise((() => {
            ReviewsModel.updateOne(query,{ reviewsNum: reviewsNum +1},function(error,result){
                if (error) {
                    logger.error(' createReviewsLevelTwo updateReviewsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createReviewsLevelTwo updateReviewsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveReviewsLevelTwo()
        .then(getReviewsNum)
        .then(updateReviewsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const deleteUserReviewsLevelTwo = (req, res, next) => {
    let params = req.params;
    let query = ReviewsLevelTwoModel.find({});

    let queryReviews = ReviewsModel.find({del_status:sysConsts.DEL_STATIS.Status.not_deleted});
    let comNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('deleteUserReviews  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.reviewsLevelTwoId ){
        if(params.reviewsLevelTwoId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.reviewsLevelTwoId ));
        }else{
            logger.info('deleteUserReviews  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const getReviewsNum = ()=>{
        return new Promise(((resolve, reject) => {
            query.populate({path:'_reviewsId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' deleteUserReviewsLevelTwo getReviewsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length > 0){
                        comNum = rows[0]._doc._reviewsId._doc.reviewsNum;
                        if(comNum){
                            comNum = comNum -1;
                        }
                        queryReviews.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._reviewsId._id));
                        logger.info(' deleteUserReviewsLevelTwo getReviewsNum _messageId:' + rows[0]._doc._reviewsId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.REVIEWSTWO_ID_NULL_ERROR});
                    }

                }
            });
        }));
    }
    const deleteReviews = ()=>{
        return new Promise(((resolve, reject) => {
            ReviewsLevelTwoModel.updateOne(query,{del_status:sysConsts.DEL_STATIS.Status.delete},function(error,result){
                if (error) {
                    logger.error(' deleteUserReviewsLevelTwo deleteReviews ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' deleteUserReviewsLevelTwo deleteReviews ' + 'success');
                    resolve(result);
                    console.log('result:',result)
                }
            })
        }));
    }
    const updateReviewsNum = (resultInfo) =>{
        return new Promise((() => {
            console.log('comNum:',comNum);
            ReviewsModel.updateOne(queryReviews,{ reviewsNum: comNum},function(error,result){
                if (error) {
                    logger.error(' deleteReviewsLevelTwo updateReviewsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' deleteReviewsLevelTwo updateReviewsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        }));
    }
    getReviewsNum()
        .then(deleteReviews)
        .then(updateReviewsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const deleteAdminReviewsLevelTwo = (req, res, next) => {
    let params = req.params;
    let query = ReviewsLevelTwoModel.find({});
    if(params.reviewsLevelTwoId){
        if(params.reviewsLevelTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.reviewsLevelTwoId));
        }else{
            logger.info('deleteAdminReviewsLevelTwo  reviewsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.REVIEWSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    ReviewsLevelTwoModel.updateOne(query,{del_status:sysConsts.DEL_STATIS.Status.delete},function(error,result){
        if (error) {
            logger.error(' deleteAdminReviewsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' deleteAdminReviewsLevelTwo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserReviewsLevelTwo,
    getAllReviewsLevelTwo,
    createReviewsLevelTwo,
    deleteUserReviewsLevelTwo,
    deleteAdminReviewsLevelTwo
};