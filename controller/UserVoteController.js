"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserVoteController');

const {UserVoteModel} = require('../modules');

const getUserVote = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserVoteModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserVote  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserVote ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserVoteByAdmin = (req, res, next) => {
    let params = req.query;
    let query = UserVoteModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getUserVote  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserVote ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserVote = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let userVoteObj = bodyParams;
    userVoteObj.status = sysConsts.INFO_STATUS.Status.available;
    if(params.userId){
        if(params.userId.length == 24){
            userVoteObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createUserVote userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let userVoteModel = new UserVoteModel(userVoteObj);
    userVoteModel.save(function(error,result){
        if (error) {
            logger.error(' createUserVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createUserVote ' + 'success');
            resUtil.resetCreateRes(res, result);
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
const updateStatusByAdmin = (req, res, next) => {
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
    getUserVote,
    getUserVoteByAdmin,
    createUserVote,
    updateStatusByUser,
    updateStatusByAdmin
};