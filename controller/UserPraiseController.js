"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
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
    let query = UserPraiseModel.find({status:sysConsts.INFO_STATUS.Status.available});

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
    userPraiseObj.status = sysConsts.INFO_STATUS.Status.available;
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
            query = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
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
            const saveUserPraise = ()=>{
                return new Promise((resolve, reject) => {
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
            const getAgreeNum = (resultInfo)=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error(' createUserPraise messageUserPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info(' createUserPraise messageUserPraise getAgreeNum ' + 'success');
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
            saveUserPraise()
                .then(getAgreeNum)
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
            query = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
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
            const saveUserPraise =()=>{
                return new Promise((resolve, reject) => {
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
            const getAgreeNum = (resultInfo)=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error(' createUserPraise commentsUserPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info(' createUserPraise commentsUserPraise getAgreeNum ' + 'success');
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
    const commentsTwoUserPraise =()=>{
        return new Promise(()=>{
            query = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
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

            const saveUserPraise = ()=>{
                return new Promise((resolve,reject)=>{
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
            const getAgreeNum = (resultInfo)=>{
                return new Promise((resolve, reject) => {
                    query.exec((error,rows)=> {
                        if (error) {
                            logger.error('createUserPraise commentsTwoUserPraise getAgreeNum ' + error.message);
                            reject(error);
                        } else {
                            if(rows.length > 0){
                                agreeNum = Number(rows[0]._doc.agreeNum);
                                logger.info('createUserPraise commentsTwoUserPraise getAgreeNum ' + 'success');
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
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
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
const updateStatusByUser = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = UserPraiseModel.find({});
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
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('updateStatusByUser  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' updateStatusByUser getUserPraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateStatusByUser getUserPraise ' + 'success');
            if(rows.length) {
                let userPraiseType = rows[0]._doc.type;
                if(userPraiseType == sysConsts.PRAISE.type.message){
                    return messageUserPraise();
                }
                if(userPraiseType == sysConsts.PRAISE.type.comments){
                    return commentsUserPraise();
                }
                if(userPraiseType == sysConsts.PRAISE.type.commentsTwo){
                    return commentsTwoUserPraise();
                }else{
                    logger.info(' updateStatusByUser getUserPraise type error ');
                    resUtil.resetFailedRes(res,systemMsg.PRAISE_TYPE_ERROR);
                    return next();
                }
            }else{
                logger.info(' updateStatusByUser getUserPraise ID error ');
                resUtil.resetFailedRes(res,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
                return next();
            }

        }
    });

    const messageUserPraise =()=>{
        return new Promise(()=>{
            let queryMessage = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.populate({path:'_messageId'}).exec((error,rows)=> {
                        if (error) {
                            logger.error(' updateStatusByUser messageUserPraise getCommentsNum ' + error.message);
                            reject({err:error});
                        } else {
                            if(rows.length){
                                agreeNum = rows[0]._doc._messageId._doc.agreeNum;
                                if(agreeNum){
                                    agreeNum = agreeNum -1;
                                }
                                queryMessage.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._messageId._id));
                                logger.info(' updateStatusByUser messageUserPraise getCommentsNum _messageId:' + rows[0]._doc._messageId._id +'success');
                                resolve();
                            }else{
                                reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const updateUserPraise =()=>{
                return new Promise((resolve, reject) => {
                    UserPraiseModel.updateOne(query,bodyParams,function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser messageUserPraise updateStatus ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info('updateStatusByUser  messageUserPraise updateStatus ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    MessageModel.updateOne(queryMessage,{ agreeNum: agreeNum},function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser messageUserPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updateStatusByUser messageUserPraise updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetUpdateRes(res,resultInfo,null);
                            return next();
                        }
                    })
                });
            }
            getAgreeNum()
                .then(updateUserPraise)
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
    const commentsUserPraise =()=>{
        return new Promise(()=>{
            let queryComments = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.populate({path:'_commentsId'}).exec((error,rows)=> {
                        if (error) {
                            logger.error(' updateStatusByUser commentsUserPraise getAgreeNum ' + error.message);
                            reject({err:error});
                        } else {
                            if(rows.length){
                                agreeNum = rows[0]._doc._commentsId._doc.agreeNum;
                                if(agreeNum){
                                    agreeNum = agreeNum -1;
                                }
                                queryComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsId._id));
                                logger.info(' updateStatusByUser commentsUserPraise getAgreeNum _commentsId:' + rows[0]._doc._commentsId._id +'success');
                                resolve();
                            }else{
                                reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const updateCommentsUserPraise =()=>{
                return new Promise((resolve, reject) =>{
                    UserPraiseModel.updateOne(query,bodyParams,function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser commentsUserPraise updateCommentsUserPraise ' + error.message);
                            reject({err:error});
                        } else {
                            logger.info(' updateStatusByUser commentsUserPraise updateCommentsUserPraise ' + 'success');
                            resolve(result);
                        }
                    })
                });
            }
            const updateAgreeNum = (resultInfo)=>{
                return new Promise(() => {
                    CommentsModel.updateOne(queryComments,{ agreeNum: agreeNum},function(error,result){
                        if (error) {
                            logger.error(' updateStatusByUser commentsUserPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updateStatusByUser commentsUserPraise updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetUpdateRes(res,resultInfo,null);
                            return next();
                        }
                    })
                });
            }
            getAgreeNum()
                .then(updateCommentsUserPraise)
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
            let queryCommentsTwo = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
            const getAgreeNum = ()=>{
                return new Promise((resolve, reject) => {
                    query.populate({path:'_commentsTwoId'}).exec((error,rows)=> {
                        if (error) {
                            logger.error(' updateStatusByUser commentsTwoUserPraise getCommentsNum ' + error.message);
                            reject({err:error});
                        } else {
                            if(rows.length){
                                agreeNum = rows[0]._doc._commentsTwoId._doc.agreeNum;
                                if(agreeNum){
                                    agreeNum = agreeNum -1;
                                }
                                queryCommentsTwo.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsTwoId._id));
                                logger.info(' updateStatusByUser commentsTwoUserPraise getCommentsNum _messageId:' + rows[0]._doc._commentsTwoId._id +'success');
                                resolve();
                            }else{
                                reject({msg:systemMsg.COMMENTSTWO_ID_NULL_ERROR});
                            }
                        }
                    });
                });
            }
            const updateCommentsUserPraise =()=>{
                return new Promise((resolve, reject) =>{
                    UserPraiseModel.updateOne(query,bodyParams,function(error,result){
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
                            logger.error(' updateStatusByUser commentsTwoUserPraise updateAgreeNum ' + error.message);
                            resUtil.resInternalError(error);
                        } else {
                            logger.info(' updateStatusByUser commentsTwoUserPraise updateAgreeNum ' + 'success');
                            console.log('rows:',result);
                            resUtil.resetUpdateRes(res,resultInfo,null);
                            return next();
                        }
                    })
                });
            }
            getAgreeNum()
                .then(updateCommentsUserPraise)
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
    let query = UserPraiseModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('updateStatus  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    UserPraiseModel.updateOne(query,bodyParams,function(error,result){
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
    getUserPraise,
    createUserPraise,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};