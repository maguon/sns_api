"use strict"
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
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
const getUserBePraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "user_details",
            localField: "_userId",
            foreignField: "_userId",
            as: "user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from: "messages_infos",
            localField: "_messageId",
            foreignField: "_id",
            as: "messages_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from: "message_comments",
            localField: "_messageCommentsId",
            foreignField: "_id",
            as: "message_comments"
        }
    });
    if(params.read_status){
        matchObj.read_status = Number(params.read_status);
    }
    aggregate_limit.push({
        $match: matchObj
    });
    if (params.start && params.size) {
        aggregate_limit.push(
            {
                $skip : Number(params.start)
            },{
                $limit : Number(params.size)
            }
        );
    };
    UserPraiseModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserBePraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            let arrAttributeSort = [];
            for(let i=0; i<rows.length; i++){
                if (path.userId){
                    if (path.userId.length == 24) {
                        if(rows[i].type == sysConsts.COUMMENT.level.firstCoumment){
                            //一级评论
                            if(rows[i].messages_info.length > 0 ){
                                if(rows[i].messages_info[0]._userId.equals(mongoose.mongo.ObjectId(path.userId))){
                                    arrAttributeSort.push(rows[i]);
                                }
                            }
                        }
                        if(rows[i].type == sysConsts.COUMMENT.level.twoCoumment){
                            //二级评论
                            if(rows[i].message_comments.length > 0 ){
                                if(rows[i].message_comments[0]._userId.equals(mongoose.mongo.ObjectId(path.userId))){
                                    arrAttributeSort.push(rows[i]);
                                }
                            }
                        }
                    } else {
                        logger.info('getUserBePraise userID format incorrect!');
                        resUtil.resetQueryRes(res, [], null);
                        return next();
                    }
                }
            }
            logger.info(' getUserBePraise ' + 'success');
            resUtil.resetQueryRes(res, arrAttributeSort);
            return next();
        }
    });
}
const createUserPraise = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let returnMessage;
    //保存点赞数据
    const savePraise =()=>{
        return new Promise((resolve, reject) => {
            let userPraiseObj = bodyParams;
            if(path.userId){
                if(path.userId.length == 24){
                    userPraiseObj._userId = mongoose.mongo.ObjectId(path.userId);
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
        return new Promise((resolve, reject) => {
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
                    if(bodyParams.type == sysConsts.COUMMENT.type.firstCoumment){
                        resUtil.resetQueryRes(res, returnMessage);
                        return next();
                    }else{
                        resolve();
                    }
                }
            });
        });
    }
    const updateMessageCommentsNum = () =>{
        return new Promise(() => {
            let queryComment = MessageCommentsModel.find({});
            if(bodyParams._messageCommentsId){
                if(bodyParams._messageCommentsId.length == 24){
                    queryComment.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageCommentsId));
                }else{
                    logger.info('createUserPraise updateMessageCommentsNum _messageCommentsId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageCommentsModel.findOneAndUpdate(queryComment,{ $inc: { agreeNum: 1 } }).exec((error,rows)=> {
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
        .then(updateMessageNum)
        .then(updateMessageCommentsNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const updateReadStatus = (req, res, next) => {
    let path = req.params;
    let query = UserPraiseModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userPraiseId){
        if(path.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userPraiseId));
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
    getUserBePraise,
    createUserPraise,
    updateReadStatus,
    getUserPraiseByAdmin
};