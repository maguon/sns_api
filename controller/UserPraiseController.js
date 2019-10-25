"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserPraiseController');

const {UserPraiseModel} = require('../modules');
const {MessageModel} = require('../modules');
const {CommentsModel} = require('../modules');
const {CommentsTwoModel} = require('../modules');

const getUserPraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserPraiseModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserPraise  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('getUserPraise  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getUserPraise  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('getUserPraise  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId){
        if(params.commentsTwoId.length == 24){
            query.where('_commentsTwoId').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('getUserPraise  commentsTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserPraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserPraise ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserPraise = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let userPraiseObj = bodyParams;
    let agreeNum = 0;
    let query;
    if(params.userId){
        if(params.userId.length == 24){
            userPraiseObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createUserPraise userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    const messageUserPraise =()=>{
        return new Promise(()=>{
            query = MessageModel.find({});
            if(bodyParams.messagesId){
                if(bodyParams.messagesId.length == 24){
                    userPraiseObj._messageId = mongoose.mongo.ObjectId(bodyParams.messagesId);
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.messagesId));
                }else{
                    logger.info('createUserPraise messageUserPraise messagesId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error(' createUserPraise messageUserPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info(' createUserPraise messageUserPraise getAgreeNum ' + 'success');
                                resolve(rows[0]);
                            }else{
                                reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const saveUserPraise = (messageInfo)=>{
                return new Promise((resolve, reject) => {
                    userPraiseObj._publishersUserId = messageInfo._userId;
                    let userPraiseModel = new UserPraiseModel(userPraiseObj);
                    userPraiseModel.save(function(error,result){
                        if (error) {
                            logger.error(' createUserPraise messageUserPraise saveUserPraise ' + error.message);
                            reject({err:reject.error});
                        } else {
                            logger.info(' createUserPraise messageUserPraise saveUserPraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    MessageModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                        if (error) {
                            logger.error(' createUserPraise messageUserPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' createUserPraise messageUserPraise updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetCreateRes(res, resultInfo);
                            return next();
                        }
                    })
                });
            }
            getAgreeNum()
                .then(saveUserPraise)
                .then(updateAgreeNum)
                .catch((reject)=>{
                    if(reject.err){
                        resUtil.resetFailedRes(res,reject.err);
                    }
                })
        });
    }
    const commentsUserPraise =()=>{
        return new Promise(()=>{
            query = CommentsModel.find({});
            if(bodyParams.commentsId){
                if(bodyParams.commentsId.length == 24){
                    userPraiseObj._commentsId = mongoose.mongo.ObjectId(bodyParams.commentsId);
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.commentsId));
                }else{
                    logger.info('createUserPraise  commentsUserPraise messagesId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
                    return next();
                }
            }
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error(' createUserPraise commentsUserPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info(' createUserPraise commentsUserPraise getAgreeNum ' + 'success');
                                resolve(rows[0]);
                            }else{
                                reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const saveUserPraise =(commentsInfo)=>{
                return new Promise((resolve, reject) => {
                    userPraiseObj._publishersUserId = commentsInfo._userId;
                    let userPraiseModel = new UserPraiseModel(userPraiseObj);
                    userPraiseModel.save(function(error,result){
                        if (error) {
                            logger.error(' createUserPraise commentsUserPraise saveUserPraise ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info(' createUserPraise commentsUserPraise saveUserPraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    CommentsModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                        if (error) {
                            logger.error(' createUserPraise updateAgreeNum updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' createUserPraise updateAgreeNum updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetCreateRes(res, resultInfo);
                            return next();
                        }
                    })
                });
            }
            getAgreeNum()
                .then(saveUserPraise)
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
    const commentsTwoUserPraise =()=>{
        return new Promise(()=>{
            query = CommentsTwoModel.find({});
            if(bodyParams.commentsTwoId){
                if(bodyParams.commentsTwoId.length == 24){
                    userPraiseObj._commentsTwoId = mongoose.mongo.ObjectId(bodyParams.commentsTwoId);
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.commentsTwoId));
                }else{
                    logger.info('createUserPraise commentsTwoUserPraise  messagesId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error('createUserPraise commentsTwoUserPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info('createUserPraise commentsTwoUserPraise getAgreeNum ' + 'success');
                                resolve(rows[0]);
                            }else{
                                reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const saveUserPraise = (commentsTwoInfo)=>{
                return new Promise((resolve,reject)=>{
                    userPraiseObj._publishersUserId = commentsTwoInfo._userId;
                    let userPraiseModel = new UserPraiseModel(userPraiseObj);
                    userPraiseModel.save(function(error,result){
                        if (error) {
                            logger.error('createUserPraise commentsTwoUserPraise saveUserPraise ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info('createUserPraise commentsTwoUserPraise saveUserPraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    CommentsTwoModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                        if (error) {
                            logger.error('createUserPraise commentsTwoUserPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info('createUserPraise commentsTwoUserPraise updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetCreateRes(res, resultInfo);
                            return next();
                        }
                    })
                });
            }
            saveUserPraise()
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
        return messageUserPraise();
    }
    if(bodyParams.type == sysConsts.PRAISE.type.comments){
        return commentsUserPraise();
    }
    if(bodyParams.type == sysConsts.PRAISE.type.commentsTwo){
        return commentsTwoUserPraise();
    }else{
        logger.info(' createUserPraise type error ');
        resUtil.resetFailedRes(res,systemMsg.PRAISE_TYPE_ERROR);
        return next();
    }
}
const updateReadStatus = (req, res, next) => {
    let params = req.params;
    let query = UserPraiseModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_publishersUserId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('updateReadStatus  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    UserPraiseModel.updateOne(query,{read_status:sysConsts.READ_STATUS.status.read},function(error,result){
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
module.exports = {
    getUserPraise,
    createUserPraise,
    updateReadStatus
};