"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('PraiseController');

const {PraiseModel} = require('../modules');
const {MessageModel} = require('../modules');
const {CommentsModel} = require('../modules');
const {CommentsTwoModel} = require('../modules');

const getPraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = PraiseModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getPraise  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseId){
        if(params.praiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseId));
        }else{
            logger.info('getPraise  praiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getPraise  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('getPraise  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId){
        if(params.commentsTwoId.length == 24){
            query.where('_commentsTwoId').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('getPraise  commentsTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
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
            logger.error(' getPraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getPraise ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createPraise = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let praiseObj = bodyParams;
    praiseObj.status = sysConsts.INFO_STATUS.Status.available;
    let agreeNum = 0;
    let query;
    if(params.userId){
        if(params.userId.length == 24){
            praiseObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createPraise userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    const messagePraise =()=>{
        return new Promise(()=>{
            query = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
            if(bodyParams.messagesId){
                if(bodyParams.messagesId.length == 24){
                    praiseObj._messageId = mongoose.mongo.ObjectId(bodyParams.messagesId);
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.messagesId));
                }else{
                    logger.info('createPraise messagePraise messagesId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            const savePraise = ()=>{
                return new Promise((resolve, reject) => {
                    let praiseModel = new PraiseModel(praiseObj);
                    praiseModel.save(function(error,result){
                        if (error) {
                            logger.error(' createPraise messagePraise savePraise ' + error.message);
                            reject({err:reject.error});
                        } else {
                            logger.info(' createPraise messagePraise savePraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const getAgreeNum = (resultInfo)=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error(' createPraise messagePraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info(' createPraise messagePraise getAgreeNum ' + 'success');
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
                            logger.error(' createPraise messagePraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' createPraise messagePraise updateAgreeNum ' + 'success');
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
        });
    }
    const commentsPraise =()=>{
        return new Promise(()=>{
            query = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
            if(bodyParams.commentsId){
                if(bodyParams.commentsId.length == 24){
                    praiseObj._commentsId = mongoose.mongo.ObjectId(bodyParams.commentsId);
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.commentsId));
                }else{
                    logger.info('createPraise  commentsPraise messagesId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
                    return next();
                }
            }
            const savePraise =()=>{
                return new Promise((resolve, reject) => {
                    let praiseModel = new PraiseModel(praiseObj);
                    praiseModel.save(function(error,result){
                        if (error) {
                            logger.error(' createPraise commentsPraise savePraise ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info(' createPraise commentsPraise savePraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const getAgreeNum = (resultInfo)=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error(' createPraise commentsPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info(' createPraise commentsPraise getAgreeNum ' + 'success');
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
                            logger.error(' createPraise updateAgreeNum updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' createPraise updateAgreeNum updateAgreeNum ' + 'success');
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
        });
    }
    const commentsTwoPraise =()=>{
        return new Promise(()=>{
            query = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
            if(bodyParams.commentsTwoId){
                if(bodyParams.commentsTwoId.length == 24){
                    praiseObj._commentsTwoId = mongoose.mongo.ObjectId(bodyParams.commentsTwoId);
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.commentsTwoId));
                }else{
                    logger.info('createPraise commentsTwoPraise  messagesId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }

            const savePraise = ()=>{
                return new Promise((resolve,reject)=>{
                    let praiseModel = new PraiseModel(praiseObj);
                    praiseModel.save(function(error,result){
                        if (error) {
                            logger.error('createPraise commentsTwoPraise savePraise ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info('createPraise commentsTwoPraise savePraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const getAgreeNum = (resultInfo)=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error('createPraise commentsTwoPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info('createPraise commentsTwoPraise getAgreeNum ' + 'success');
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
                            logger.error('createPraise commentsTwoPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info('createPraise commentsTwoPraise updateAgreeNum ' + 'success');
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
        });
    }
    if(bodyParams.type == sysConsts.PRAISE.type.message){
        return messagePraise();
    }
    if(bodyParams.type == sysConsts.PRAISE.type.comments){
        return commentsPraise();
    }
    if(bodyParams.type == sysConsts.PRAISE.type.commentsTwo){
        return commentsTwoPraise();
    }else{
        logger.info(' createPraise type error ');
        resUtil.resetFailedRes(res,systemMsg.PRAISE_TYPE_ERROR);
        return next();
    }
}
const updateReadStatus = (req, res, next) => {
    let params = req.params;
    let query = PraiseModel.find({});
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
    PraiseModel.updateOne(query,{read_status:sysConsts.READ_STATUS.status.read},function(error,result){
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
    let bodyParams = req.body;
    let params = req.params;
    let query = PraiseModel.find({});
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
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' updateStatusByUser getPraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateStatusByUser getPraise ' + 'success');
            if(rows.length) {
                let praiseType = rows[0]._doc.type;
                if(praiseType == sysConsts.PRAISE.type.message){
                    return messagePraise();
                }
                if(praiseType == sysConsts.PRAISE.type.comments){
                    return commentsPraise();
                }
                if(praiseType == sysConsts.PRAISE.type.commentsTwo){
                    return commentsTwoPraise();
                }else{
                    logger.info(' updateStatusByUser getPraise type error ');
                    resUtil.resetFailedRes(res,systemMsg.PRAISE_TYPE_ERROR);
                    return next();
                }
            }else{
                logger.info(' updateStatusByUser getPraise ID error ');
                resUtil.resetFailedRes(res,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
                return next();
            }

        }
    });

    const messagePraise =()=>{
        return new Promise(()=>{
            let queryMessage = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.populate({path:'_messageId'}).exec((error,rows)=> {
                        if (error) {
                            logger.error(' updateStatusByUser messagePraise getCommentsNum ' + error.message);
                            reject({err:error});
                        } else {
                            if(rows.length){
                                agreeNum = rows[0]._doc._messageId._doc.agreeNum;
                                if(agreeNum){
                                    agreeNum = agreeNum -1;
                                }
                                queryMessage.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._messageId._id));
                                logger.info(' updateStatusByUser messagePraise getCommentsNum _messageId:' + rows[0]._doc._messageId._id +'success');
                                resolve();
                            }else{
                                reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const updatePraise =()=>{
                return new Promise((resolve, reject) => {
                    PraiseModel.updateOne(query,bodyParams,function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser messagePraise updateStatus ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info('updateStatusByUser  messagePraise updateStatus ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    MessageModel.updateOne(queryMessage,{ agreeNum: agreeNum},function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser messagePraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updateStatusByUser messagePraise updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetUpdateRes(res,resultInfo,null);
                            return next();
                        }
                    })
                });
            }
            getAgreeNum()
                .then(updatePraise)
                .then(updateAgreeNum)
                .catch((reject)=>{
                    if(reject.err){
                        resUtil.resetFailedRes(res,reject.err);
                    }else{
                        resUtil.resetFailedRes(res,reject.msg);
                    }
                })
        });
    }
    const commentsPraise =()=>{
        return new Promise(()=>{
            let queryComments = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.populate({path:'_commentsId'}).exec((error,rows)=> {
                        if (error) {
                            logger.error(' updateStatusByUser commentsPraise getAgreeNum ' + error.message);
                            reject({err:error});
                        } else {
                            if(rows.length){
                                agreeNum = rows[0]._doc._commentsId._doc.agreeNum;
                                if(agreeNum){
                                    agreeNum = agreeNum -1;
                                }
                                queryComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsId._id));
                                logger.info(' updateStatusByUser commentsPraise getAgreeNum _commentsId:' + rows[0]._doc._commentsId._id +'success');
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
                    PraiseModel.updateOne(query,bodyParams,function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser commentsPraise updateCommentsPraise ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info(' updateStatusByUser commentsPraise updateCommentsPraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    CommentsModel.updateOne(queryComments,{ agreeNum: agreeNum},function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser commentsPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updateStatusByUser commentsPraise updateAgreeNum ' + 'success');
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
        });
    }
    const commentsTwoPraise =()=>{
        return new Promise(()=>{
            let queryCommentsTwo = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.populate({path:'_commentsTwoId'}).exec((error,rows)=> {
                        if (error) {
                            logger.error(' updateStatusByUser commentsTwoPraise getCommentsNum ' + error.message);
                            reject({err:error});
                        } else {
                            if(rows.length){
                                agreeNum = rows[0]._doc._commentsTwoId._doc.agreeNum;
                                if(agreeNum){
                                    agreeNum = agreeNum -1;
                                }
                                queryCommentsTwo.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsTwoId._id));
                                logger.info(' updateStatusByUser commentsTwoPraise getCommentsNum _messageId:' + rows[0]._doc._commentsTwoId._id +'success');
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
                    PraiseModel.updateOne(query,bodyParams,function(error,result){
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
                            logger.error(' updateStatusByUser commentsTwoPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updateStatusByUser commentsTwoPraise updateAgreeNum ' + 'success');
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
        });
    }


}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = PraiseModel.find({});
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
    PraiseModel.updateOne(query,bodyParams,function(error,result){
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
    getPraise,
    createPraise,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};