"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserPraiseController');

const {UserPraiseModel} = require('../modules');
const {MessageModel} = require('../modules');
const {MessageCommentsModel} = require('../modules');

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
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getUserPraise  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
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
    let returnMessage;
    //保存点赞数据
    const savePraise =()=>{
        return new Promise((resolve, reject) => {
            let userPraiseObj = bodyParams;
            if(params.userId){
                if(params.userId.length == 24){
                    userPraiseObj._userId = mongoose.mongo.ObjectId(params.userId);
                }else{
                    logger.info('createUserPraise savePraise userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            userPraiseObj.read_status = sysConsts.INFO.read_status.unread;
            let userPraiseModel = new UserPraiseModel(userPraiseObj);
            userPraiseModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserPraise savePraise ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserPraise savePraise ' + 'success');
                    returnMessage = result;
                    resolve();
                }
            })
        });
    }
    const updateMessageNum = () =>{
        return new Promise(() => {
            let query = MessageModel.find({});
            if(bodyParams._messageId){
                if(bodyParams._messageId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageId));
                }else{
                    logger.info('createUserPraise updateMessageNum _messageId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageModel.findOneAndUpdate(query,{ $inc: { agreeNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserPraise updateMessageNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createUserPraise updateMessageNum ' + 'success');
                    resUtil.resetQueryRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    const updateMessageCommentsNum = () =>{
        return new Promise(() => {
            let query = MessageCommentsModel.find({});
            if(bodyParams._messageCommentsId){
                if(bodyParams._messageCommentsId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageCommentsId));
                }else{
                    logger.info('createUserPraise updateMessageCommentsNum _messageCommentsId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageCommentsModel.findOneAndUpdate(query,{ $inc: { agreeNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserPraise updateMessageCommentsNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createUserPraise updateMessageCommentsNum ' + 'success');
                    resUtil.resetQueryRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    savePraise()
        .then(()=>{
            if(bodyParams.type == sysConsts.COUMMENT.type.firstCoumment){
                //更新文章
                updateMessageNum();
            }else{
                //更新评论
                updateMessageCommentsNum();
            }
        })
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
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
    UserPraiseModel.updateOne(query,{read_status:sysConsts.INFO.read_status.read},function(error,result){
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
const getUserPraiseByAdmin = (req, res, next) => {
    let params = req.query;
    let query = UserPraiseModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getUserPraiseByAdmin  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('getUserPraiseByAdmin  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getUserPraiseByAdmin  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getUserPraiseByAdmin  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
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
            logger.error(' getUserPraiseByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserPraiseByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
module.exports = {
    getUserPraise,
    createUserPraise,
    updateReadStatus,
    getUserPraiseByAdmin
};