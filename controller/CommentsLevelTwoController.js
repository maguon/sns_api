"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsLevelTwoController');

const {CommentsLevelTwoModel} = require('../modules');
const {CommentsModel} = require('../modules');

const getUserCommentsLevelTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsLevelTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserCommentsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getUserCommentsLevelTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getUserCommentsLevelTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoId){
        if(path.commentsLevelTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsLevelTwoId));
        }else{
            logger.info('getUserCommentsLevelTwo  commentsLevelTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoMsg){
        query.where('commentsLevelTwoMsg').equals(params.commentsLevelTwoMsg);
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
            logger.error(' getUserCommentsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserCommentsLevelTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllCommentsLevelTwo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsLevelTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.messagesId){
        if(path.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(path.messagesId));
        }else{
            logger.info('getAllCommentsLevelTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            query.where('_commentsId').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('getAllCommentsLevelTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoMsg){
        query.where('commentsLevelTwoMsg').equals(params.commentsLevelTwoMsg);
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
            logger.error(' getAllCommentsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllCommentsLevelTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsLevelTwo = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let commentsLevelTwoModelObj = bodyParams;

    let query = CommentsModel.find();
    let commentsNum = 0;

    if(path.userId){
        if(path.userId.length == 24){
            commentsLevelTwoModelObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createCommentsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            commentsLevelTwoModelObj._messageId = mongoose.mongo.ObjectId(path.messagesId);
        }else{
            logger.info('createCommentsLevelTwo  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.commentsId){
        if(path.commentsId.length == 24){
            commentsLevelTwoModelObj._commentsId = mongoose.mongo.ObjectId(path.commentsId);
            query.where('_id').equals(mongoose.mongo.ObjectId(path.commentsId));
        }else{
            logger.info('createCommentsLevelTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const saveCommentsLevelTwo = ()=>{
        return new Promise(((resolve, reject) => {
            let commentsLevelTwoModel = new CommentsLevelTwoModel(commentsLevelTwoModelObj);
            commentsLevelTwoModel.save(function(error,result){
                if (error) {
                    logger.error(' createCommentsLevelTwo saveCommentsLevelTwo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createCommentsLevelTwo saveCommentsLevelTwo ' + 'success');
                    resolve(result);
                }
            });
        }));
    }
    const getCommentsNum = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createCommentsLevelTwo getCommentsNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length>0){
                        commentsNum = Number(rows[0]._doc.commentsNum);
                        logger.info(' createCommentsLevelTwo getCommentsNum ' + 'success');
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
                    logger.error(' createCommentsLevelTwo updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createCommentsLevelTwo updateCommentsNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        }));
    }
    saveCommentsLevelTwo()
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
    let query = CommentsLevelTwoModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoId){
        if(params.commentsLevelTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsLevelTwoId));
        }else{
            logger.info('updateReadStatus  commentsLevelTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsLevelTwoModel.updateOne(query,bodyParams,function(error,result){
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
const updateUserCommentsLevelTwo = (req, res, next) => {
    let params = req.params;
    let query = CommentsLevelTwoModel.find({});

    let queryComments = CommentsModel.find();
    let comNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserCommentsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoId ){
        if(params.commentsLevelTwoId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsLevelTwoId ));
        }else{
            logger.info('updateUserCommentsLevelTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    const getCommentsNum = ()=>{
        return new Promise(((resolve, reject) => {
            query.populate({path:'_commentsId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateUserCommentsLevelTwo getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length > 0){
                        comNum = rows[0]._doc._commentsId._doc.commentsNum;
                        if(comNum){
                            comNum = comNum -1;
                        }
                        queryComments.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsId._id));
                        logger.info(' updateUserCommentsLevelTwo getCommentsNum _messageId:' + rows[0]._doc._commentsId._id +'success');
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
            CommentsLevelTwoModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' updateUserCommentsLevelTwo updataComments ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' updateUserCommentsLevelTwo updataComments ' + 'success');
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
                    logger.error(' updateUserCommentsLevelTwo updateCommentsNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateUserCommentsLevelTwo updateCommentsNum ' + 'success');
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
const updateAdminCommentsLevelTwo = (req, res, next) => {
    let params = req.params;
    let query = CommentsLevelTwoModel.find({});
    if(params.commentsLevelTwoId){
        if(params.commentsLevelTwoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsLevelTwoId));
        }else{
            logger.info('updateAdminCommentsLevelTwo  commentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsLevelTwoModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
        if (error) {
            logger.error(' updateAdminCommentsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' updateAdminCommentsLevelTwo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserCommentsLevelTwo,
    getAllCommentsLevelTwo,
    createCommentsLevelTwo,
    updateReadStatus,
    updateUserCommentsLevelTwo,
    updateAdminCommentsLevelTwo
};