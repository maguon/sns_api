"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsController');

const {CommentsModel} = require('../modules');
const {MessageModel} = require('../modules');

const getUserComments = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getUserComments  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsMsg){
        query.where('commentsMsg').equals(params.commentsMsg);
    }
    if(params.commentsNum){
        query.where('commentsNum').equals(params.commentsNum);
    }
    if(params.agreeNum){
        query.where('agreeNum').equals(params.agreeNum);
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
            logger.error(' getUserComments ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserComments ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllComments = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getAllComments  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsMsg){
        query.where('commentsMsg').equals(params.commentsMsg);
    }
    if(params.commentsNum){
        query.where('commentsNum').equals(params.commentsNum);
    }
    if(params.agreeNum){
        query.where('agreeNum').equals(params.agreeNum);
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
            logger.error(' getAllComments ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllComments ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createComments = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let commentsObj = bodyParams;

    let query = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let commentsNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            commentsObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            commentsObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('createComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    const saveComments = ()=>{
        return new Promise(((resolve, reject) => {
            let commentsModel = new CommentsModel(commentsObj);
            commentsModel.save(function(error,result){
                if (error) {
                    logger.error(' createComments saveComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createComments saveComments ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getCommentsNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createComments getCommentsNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        commentsNum = Number(rows[0]._doc.commentsNum);
                        logger.info(' createComments getCommentsNum ' + 'success');
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
                    logger.error(' createComments updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createComments updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveComments()
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
    let query = CommentsModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('updateReadStatus  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsModel.updateOne(query,bodyParams,function(error,result){
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
const deleteUserComments = (req, res, next) => {
    let params = req.params;
    let query = CommentsModel.find({});

    let queryMessage = MessageModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let comNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('deleteUserComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('deleteUserComments  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    const getCommentsNum = ()=>{
        return new Promise(((resolve, reject) => {
            query.populate({path:'_messageId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' deleteUserComments getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        comNum = rows[0]._doc._messageId._doc.commentsNum;
                        if(comNum){
                            comNum = comNum -1;
                        }
                        queryMessage.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._messageId._id));
                        logger.info(' deleteUserComments getCommentsNum _messageId:' + rows[0]._doc._messageId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.MESSAGE_ID_NULL_ERROR});
                    }

                }
            });
        }));
    }
    const deleteComments = ()=>{
        return new Promise(((resolve, reject) => {
            CommentsModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' deleteUserComments deleteComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' deleteUserComments deleteComments ' + 'success');
                    resolve(result);
                    console.log('result:',result)
                }
            })
        }));
    }
    const updateCommentsNum = (resultInfo) =>{
        return new Promise((() => {
            console.log('comNum:',comNum);
            MessageModel.updateOne(queryMessage,{ commentsNum: comNum},function(error,result){
                if (error) {
                    logger.error(' deleteComments updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' deleteComments updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        }));
    }
    getCommentsNum()
        .then(deleteComments)
        .then(updateCommentsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const deleteAdminComments = (req, res, next) => {
    let params = req.params;
    let query = CommentsModel.find({});
    if(params.commentsId){
        if(params.commentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsId));
        }else{
            logger.info('deleteAdminComments  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getUserComments,
    getAllComments,
    createComments,
    updateReadStatus,
    deleteUserComments,
    deleteAdminComments
};