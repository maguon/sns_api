"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const oAuthUtil = require('../util/OAuthUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('CommentsLevelTwoPraiseRecordController');

const {CommentsLevelTwoPraiseRecordModel} = require('../modules');
const {CommentsLevelTwoModel} = require('../modules');

const getCommentsLevelTwoPraiseRecord = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = CommentsLevelTwoPraiseRecordModel.find({status:sysConsts.INFO_STATUS.Status.available});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserCommentsLevelTwo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoId){
        if(params.commentsLevelTwoId.length == 24){
            query.where('_commentsLevelTwoId').equals(mongoose.mongo.ObjectId(params.commentsLevelTwoId));
        }else{
            logger.info('getUserCommentsLevelTwo  commentsLevelTwoId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTSTWO_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateReadStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
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
            logger.error(' getUserCommentsLevelTwo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserCommentsLevelTwo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createCommentsLevelTwoPraiseRecord = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let commentsLevelTwoPraiseRecordObj = bodyParams;

    let query = CommentsLevelTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            commentsLevelTwoPraiseRecordObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createCommentsLevelTwoPraiseRecord userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.commentsLevelTwoId){
        if(params.commentsLevelTwoId.length == 24){
            commentsLevelTwoPraiseRecordObj._commentsLevelTwoId = mongoose.mongo.ObjectId(params.commentsLevelTwoId);
            query.where('_id').equals(mongoose.mongo.ObjectId(params.commentsLevelTwoId));
        }else{
            logger.info('createCommentsLevelTwoPraiseRecord  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }

    const savePraiseRecord = ()=>{
        return new Promise((resolve,reject)=>{
            let commentsLevelTwoPraiseRecordModel = new CommentsLevelTwoPraiseRecordModel(commentsLevelTwoPraiseRecordObj);
            commentsLevelTwoPraiseRecordModel.save(function(error,result){
                if (error) {
                    logger.error(' createCommentsLevelTwoPraiseRecord savePraiseRecord ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createCommentsLevelTwoPraiseRecord savePraiseRecord ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const getAgreeNum = (resultInfo)=>{
        return new Promise((resolve, reject) => {
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createCommentsLevelTwoPraiseRecord getAgreeNum ' + error.message);
                    reject(error);
                } else {
                    if(rows.length > 0){
                        agreeNum = Number(rows[0]._doc.agreeNum);
                        logger.info(' createCommentsLevelTwoPraiseRecord getAgreeNum ' + 'success');
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
            CommentsLevelTwoModel.updateOne(query,{ agreeNum: agreeNum +1},function(error,result){
                if (error) {
                    logger.error(' createCommentsLevelTwoPraiseRecord updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createCommentsLevelTwoPraiseRecord updateAgreeNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetCreateRes(res, resultInfo);
                    return next();
                }
            })
        });
    }
    savePraiseRecord()
        .then(getAgreeNum)
        .then(updateAgreeNum)
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
    let query = CommentsLevelTwoPraiseRecordModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateReadStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsLevelTwoPraiseRecordModel.updateOne(query,bodyParams,function(error,result){
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
    let params = req.params;
    let query = CommentsLevelTwoPraiseRecordModel.find({});

    let queryCommentsLevelTwo = CommentsLevelTwoModel.find({status:sysConsts.INFO_STATUS.Status.available});
    let agreeNum = 0;

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    const getAgreeNum = ()=>{
        return new Promise((resolve, reject) => {
            query.populate({path:'_commentsLevelTwoId'}).exec((error,rows)=> {
                if (error) {
                    logger.error(' updateStatusByUser getCommentsNum ' + error.message);
                    reject({err:error});
                } else {
                    if(rows.length){
                        agreeNum = rows[0]._doc._commentsLevelTwoId._doc.agreeNum;
                        if(agreeNum){
                            agreeNum = agreeNum -1;
                        }
                        queryCommentsLevelTwo.where('_id').equals(mongoose.mongo.ObjectId(rows[0]._doc._commentsLevelTwoId._id));
                        logger.info(' updateStatusByUser getCommentsNum _messageId:' + rows[0]._doc._commentsLevelTwoId._id +'success');
                        resolve();
                    }else{
                        reject({msg:systemMsg.COMMENTSTWO_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    const updateCommentsPraiseRecord =()=>{
        return new Promise((resolve, reject) =>{
            CommentsLevelTwoPraiseRecordModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
            CommentsLevelTwoModel.updateOne(queryCommentsLevelTwo,{ agreeNum: agreeNum},function(error,result){
                if (error) {
                    logger.error(' updateStatusByUser updateAgreeNum ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateStatusByUser updateAgreeNum ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        });
    }
    getAgreeNum()
        .then(updateCommentsPraiseRecord)
        .then(updateAgreeNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateStatus = (req, res, next) => {
    let params = req.params;
    let query = CommentsLevelTwoPraiseRecordModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.praiseRecordId){
        if(params.praiseRecordId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.praiseRecordId));
        }else{
            logger.info('updateStatus  praiseRecordId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    CommentsLevelTwoPraiseRecordModel.updateOne(query,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
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
    getCommentsLevelTwoPraiseRecord,
    createCommentsLevelTwoPraiseRecord,
    updateReadStatus,
    updateStatusByUser,
    updateStatus
};