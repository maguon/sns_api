"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessageCommentsController');

const {MessageCommentsModel} = require('../modules');
const {MessageCommentsTwoModel} = require('../modules');
const {MessageModel} = require('../modules');

const getUserMessageComments = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessageCommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMessageComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('getUserMessageComments  messageCommentsId format incorrect!');
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
            logger.error(' getUserMessageComments ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMessageComments ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllMessageComments = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessageCommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('getAllMessageComments  messageCommentsId format incorrect!');
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
            logger.error(' getAllMessageComments ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllMessageComments ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createMessageComments = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let messageCommentsObj = bodyParams;
    messageCommentsObj.status = sysConsts.INFO_STATUS.Status.available;
    messageCommentsObj.commentsNum = 0;
    messageCommentsObj.agreeNum = 0;

    let query = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let commentsNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            messageCommentsObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createMessageComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            messageCommentsObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('createMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    const saveMessageComments = ()=>{
        return new Promise(((resolve, reject) => {
            let messageCommentsModel = new MessageCommentsModel(messageCommentsObj);
            messageCommentsModel.save(function(error,result){
                if (error) {
                    logger.error(' createMessageComments saveMessageComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createMessageComments saveMessageComments ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getCommentsNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessageComments getCommentsNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        commentsNum = Number(rows[0]._doc.commentsNum);
                        logger.info(' createMessageComments getCommentsNum ' + 'success');
                        resolve(resultInfo);
                    }else{
                        reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                    }

                }
            });
        }));
    }
    const updateCommentsNum = (resultInfo) =>{
        return new Promise((() => {
            MessageModel.updateOne(query,{ commentsNum: commentsNum +1},function(error,result){
                if (error) {
                    logger.error(' createMessageComments updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createMessageComments updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveMessageComments()
        .then(getCommentsNum)
        .then(updateCommentsNum)
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
    let query = MessageCommentsModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('updateReadStatus  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsModel.updateOne(query,bodyParams,function(error,result){
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
const updateUserMessageCommentsStatus = (req, res, next) => {
    let params = req.params;
    let query = MessageCommentsModel.find({});
    let queryMessageCommentsTwo = MessageCommentsTwoModel.find({});
    let queryMessage = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let comNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserMessageCommentsStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
            queryCommentsTwo.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('updateUserMessageCommentsStatus  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    const getCommentsNum = ()=>{
        return new Promise((resolve, reject) => {
            query.populate({path:'_messageId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateUserMessageCommentsStatus getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        comNum = rows[0]._doc._messageId._doc.commentsNum;
                        if(comNum){
                            comNum = comNum -1;
                        }
                        queryMessage.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._messageId._id));
                        logger.info(' updateUserMessageCommentsStatus getCommentsNum _messageId:' + rows[0]._doc._messageId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateMessageComments = ()=>{
        return new Promise((resolve, reject) => {
            MessageCommentsModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateUserMessageCommentsStatus updateMessageComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' deleteUserMessageComments updateMessageComments ' + 'success');
                    resolve(result);
                    console.log('result:',result)
                }
            })
        });
    }
    const updateMessageCommentsTwo = ()=>{
        return new Promise((resolve, reject) => {
            MessageCommentsTwoModel.updateOne(queryMessageCommentsTwo,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateUserMessageCommentsStatus updateMessageCommentsTwo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' updateUserMessageCommentsStatus updateMessageCommentsTwo ' + 'success');
                    resolve(result);
                    console.log('result:',result)
                }
            })
        });
    }
    const updateCommentsNum = (resultInfo) =>{
        return new Promise(() => {
            console.log('comNum:',comNum);
            MessageModel.updateOne(queryMessage,{ commentsNum: comNum},function(error,result){
                if (error) {
                    logger.error(' updateUserMessageCommentsStatus updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateUserMessageCommentsStatus updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        });
    }
    getCommentsNum()
        .then(updateMessageComments)
        .then(updateMessageCommentsTwo)
        .then(updateCommentsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateAdminMessageCommentsStatus = (req, res, next) => {
    let params = req.params;
    let query = MessageCommentsModel.find({});
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('deleteAdminMessageComments  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
        if (error) {
            logger.error(' updateOne ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateOne ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserMessageComments,
    getAllMessageComments,
    createMessageComments,
    updateReadStatus,
    updateUserMessageCommentsStatus,
    updateAdminMessageCommentsStatus
};