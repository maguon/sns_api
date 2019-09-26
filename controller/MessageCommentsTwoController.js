"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessageCommentsTwoController');

const {MessageCommentsTwoModel} = require('../modules');
const {MessageCommentsModel} = require('../modules');

const getUserMessageCommentsTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessageCommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMessageCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserMessageCommentsTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('getUserMessageCommentsTwo  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsTwoId){
        if(path.messageCommentsTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsTwoId));
        }else{
            logger.info('getUserMessageCommentsTwo  messageCommentsTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
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
            logger.error(' getUserMessageCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMessageCommentsTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllMessageCommentsTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessageCommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllMessageCommentsTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_messageCommentsId').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('getAllMessageCommentsTwo  messageCommentsId format incorrect!');
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
            logger.error(' getAllMessageCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllMessageCommentsTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createMessageCommentsTwo = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let messageCommentsTwoModelObj = bodyParams;
    messageCommentsTwoModelObj.status = sysConsts.INFO_STATUS.Status.available;
    messageCommentsTwoModelObj.agreeNum = 0;

    let query = MessageCommentsModel.find();
    let commentsNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            messageCommentsTwoModelObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createMessageCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            messageCommentsTwoModelObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
        }else{
            logger.info('createMessageCommentsTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            messageCommentsTwoModelObj._messageCommentsId = mongoose.mongo.ObjectId(path.messageCommentsId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('createMessageCommentsTwo  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const saveMessageCommentsTwo = ()=>{
        return new Promise(((resolve, reject) => {
            let messageCommentsTwoModel = new MessageCommentsTwoModel(messageCommentsTwoModelObj);
            messageCommentsTwoModel.save(function(error,result){
                if (error) {
                    logger.error(' createMessageCommentsTwo saveMessageCommentsTwo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createMessageCommentsTwo saveMessageCommentsTwo ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getCommentsNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessageCommentsTwo getCommentsNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length>0){
                        commentsNum = Number(rows[0]._doc.commentsNum);
                        logger.info(' createMessageCommentsTwo getCommentsNum ' + 'success');
                        resolve(resultInfo);
                    }else{
                        reject({msg:systemMsg.COMMENTS_ID_NULL_ERROR});
                    }
                }
            });
        }));
    }
    const updateCommentsNum = (resultInfo) =>{
        return new Promise((() => {
            MessageCommentsModel.updateOne(query,{ commentsNum: commentsNum +1},function(error,result){
                if (error) {
                    logger.error(' createMessageCommentsTwo updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createMessageCommentsTwo updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveMessageCommentsTwo()
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
    let query = MessageCommentsTwoModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsTwoId){
        if(params.messageCommentsTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsTwoId));
        }else{
            logger.info('updateReadStatus  messageCommentsTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsTwoModel.updateOne(query,bodyParams,function(error,result){
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
const updateUserMessageCommentsTwo = (req, res, next) => {
    let params = req.params;
    let query = MessageCommentsTwoModel.find({});

    let queryMessageComments = MessageCommentsModel.find();
    let comNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserMessageCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsTwoId ){
        if(params.messageCommentsTwoId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsTwoId ));
        }else{
            logger.info('updateUserMessageCommentsTwo  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const getCommentsNum = ()=>{
        return new Promise(((resolve, reject) => {
            query.populate({path:'_messageCommentsId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateUserMessageCommentsTwo getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length > 0){
                        comNum = rows[0]._doc._messageCommentsId._doc.commentsNum;
                        if(comNum){
                            comNum = comNum -1;
                        }
                        queryMessageComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._messageCommentsId._id));
                        logger.info(' updateUserMessageCommentsTwo getCommentsNum _messageId:' + rows[0]._doc._messageCommentsId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.COMMENTSTWO_ID_NULL_ERROR});
                    }

                }
            });
        }));
    }
    const updataMessageComments = ()=>{
        return new Promise(((resolve, reject) => {
            MessageCommentsTwoModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateUserMessageCommentsTwo updataMessageComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' updateUserMessageCommentsTwo updataMessageComments ' + 'success');
                    resolve(result);
                    console.log('result:',result)
                }
            })
        }));
    }
    const updateCommentsNum = (resultInfo) =>{
        return new Promise((() => {
            console.log('comNum:',comNum);
            MessageCommentsModel.updateOne(queryMessageComments,{ commentsNum: comNum},function(error,result){
                if (error) {
                    logger.error(' updateUserMessageCommentsTwo updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateUserMessageCommentsTwo updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        }));
    }
    getCommentsNum()
        .then(updataMessageComments)
        .then(updateCommentsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateAdminMessageCommentsTwo = (req, res, next) => {
    let params = req.params;
    let query = MessageCommentsTwoModel.find({});
    if(params.messageCommentsTwoId){
        if(params.messageCommentsTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsTwoId));
        }else{
            logger.info('updateAdminMessageCommentsTwo  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsTwoModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
        if (error) {
            logger.error(' updateAdminMessageCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateAdminMessageCommentsTwo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserMessageCommentsTwo,
    getAllMessageCommentsTwo,
    createMessageCommentsTwo,
    updateReadStatus,
    updateUserMessageCommentsTwo,
    updateAdminMessageCommentsTwo
};