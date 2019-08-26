"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsTwoController');

const {CommentsTwoModel} = require('../modules');
const {CommentsModel} = require('../modules');

const getUserCommentsTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserCommentsTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getUserCommentsTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId){
        if(path.commentsTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('getUserCommentsTwo  commentsTwoId format incorrect!');
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
            logger.error(' getUserCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserCommentsTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllCommentsTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllCommentsTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getAllCommentsTwo  commentsId format incorrect!');
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
            logger.error(' getAllCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllCommentsTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsTwo = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let commentsTwoModelObj = bodyParams;
    commentsTwoModelObj.status = sysConsts.INFO_STATUS.Status.available;
    commentsTwoModelObj.agreeNum = 0;

    let query = CommentsModel.find();
    let commentsNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            commentsTwoModelObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            commentsTwoModelObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
        }else{
            logger.info('createCommentsTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            commentsTwoModelObj._commentsId = mongoose.mongo.ObjectId(path.commentsId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('createCommentsTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const saveCommentsTwo = ()=>{
        return new Promise(((resolve, reject) => {
            let commentsTwoModel = new CommentsTwoModel(commentsTwoModelObj);
            commentsTwoModel.save(function(error,result){
                if (error) {
                    logger.error(' createCommentsTwo saveCommentsTwo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createCommentsTwo saveCommentsTwo ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getCommentsNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createCommentsTwo getCommentsNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length>0){
                        commentsNum = Number(rows[0]._doc.commentsNum);
                        logger.info(' createCommentsTwo getCommentsNum ' + 'success');
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
            CommentsModel.updateOne(query,{ commentsNum: commentsNum +1},function(error,result){
                if (error) {
                    logger.error(' createCommentsTwo updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createCommentsTwo updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveCommentsTwo()
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
    let query = CommentsTwoModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId){
        if(params.commentsTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('updateReadStatus  commentsTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsTwoModel.updateOne(query,bodyParams,function(error,result){
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
const updateUserCommentsTwo = (req, res, next) => {
    let params = req.params;
    let query = CommentsTwoModel.find({});

    let queryComments = CommentsModel.find();
    let comNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserCommentsTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsTwoId ){
        if(params.commentsTwoId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsTwoId ));
        }else{
            logger.info('updateUserCommentsTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const getCommentsNum = ()=>{
        return new Promise(((resolve, reject) => {
            query.populate({path:'_commentsId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateUserCommentsTwo getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length > 0){
                        comNum = rows[0]._doc._commentsId._doc.commentsNum;
                        if(comNum){
                            comNum = comNum -1;
                        }
                        queryComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsId._id));
                        logger.info(' updateUserCommentsTwo getCommentsNum _messageId:' + rows[0]._doc._commentsId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.COMMENTSTWO_ID_NULL_ERROR});
                    }

                }
            });
        }));
    }
    const updataComments = ()=>{
        return new Promise(((resolve, reject) => {
            CommentsTwoModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateUserCommentsTwo updataComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' updateUserCommentsTwo updataComments ' + 'success');
                    resolve(result);
                    console.log('result:',result)
                }
            })
        }));
    }
    const updateCommentsNum = (resultInfo) =>{
        return new Promise((() => {
            console.log('comNum:',comNum);
            CommentsModel.updateOne(queryComments,{ commentsNum: comNum},function(error,result){
                if (error) {
                    logger.error(' updateUserCommentsTwo updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateUserCommentsTwo updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        }));
    }
    getCommentsNum()
        .then(updataComments)
        .then(updateCommentsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateAdminCommentsTwo = (req, res, next) => {
    let params = req.params;
    let query = CommentsTwoModel.find({});
    if(params.commentsTwoId){
        if(params.commentsTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsTwoId));
        }else{
            logger.info('updateAdminCommentsTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsTwoModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
        if (error) {
            logger.error(' updateAdminCommentsTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateAdminCommentsTwo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserCommentsTwo,
    getAllCommentsTwo,
    createCommentsTwo,
    updateReadStatus,
    updateUserCommentsTwo,
    updateAdminCommentsTwo
};