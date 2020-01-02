"use strict"
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessageCommentsController');

const {MessageCommentsModel} = require('../modules');
const {MessageModel} = require('../modules');
const {UserModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUserMessageComments = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MessageCommentsModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMessageComments  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getUserMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getUserMessageComments  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesType){
        query.where('messages_type').equals(params.messagesType);
    }
    if(params.level){
        query.where('level').equals(params.level);
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
    let params = req.query;
    let query = MessageCommentsModel.find({});
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getAllMessageComments  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messageCommentsId));
        }else{
            logger.info('getAllMessageComments  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.level){
        query.where('level').equals(params.level);
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
    let returnMessage;
    //保存新评论信息
    const saveMessageComments = ()=>{
        return new Promise((resolve, reject) => {
            let messageCommentsObj = bodyParams;
            messageCommentsObj.status = sysConsts.COUMMENT.status.normal;
            messageCommentsObj.read_status = sysConsts.INFO.read_status.unread;
            messageCommentsObj.commentsNum = 0;
            messageCommentsObj.agreeNum = 0;
            if(path.userId){
                if(path.userId.length == 24){
                    messageCommentsObj._userId = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createMessageComments userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            let messageCommentsModel = new MessageCommentsModel(messageCommentsObj);
            messageCommentsModel.save(function(error,result){
                if (error) {
                    logger.error(' createMessageComments saveMessageComments ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createMessageComments saveMessageComments ' + 'success');
                    returnMessage = result;
                    resolve();
                }
            });
        });
    }
    //更新用户的评论数
    const updateUserNumber =()=>{
        return new Promise((resolve, reject) => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createMessageComments updateUserNumber _userId format incorrect!');
                    return next();
                }
            }
            if(bodyParams.level == 1){
                //文章评论数加一
                UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { commentsNum: 1 } }).exec((error,rows)=> {
                    if (error) {
                        logger.error(' createMessageComments updateUserNumber ' + error.message);
                    } else {
                        logger.info(' createMessageComments updateUserNumber ' + 'success');
                        resolve();
                    }
                });
            }else{
                //回复评论数加一
                UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { commentsReplyNum: 1 } }).exec((error,rows)=> {
                    if (error) {
                        logger.error(' createMessageComments updateUserNumber ' + error.message);
                    } else {
                        logger.info(' createMessageComments updateUserNumber ' + 'success');
                        resolve();
                    }
                });
            }

        });
    }
    //更新动态的评论数（一级评论）
    const updateMessageNum = () =>{
        return new Promise(() => {
            let query = MessageModel.find({});
            if(bodyParams._messageId){
                if(bodyParams._messageId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageId));
                }else{
                    logger.info('createMessageComments updateMessageNum _messageId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageModel.findOneAndUpdate(query,{ $inc: { commentsNum: 1 } },).exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessageComments updateMessageNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMessageComments updateMessageNum ' + 'success');
                    resUtil.resetQueryRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    //更新评论的评论数（二级评论）
    const updateMessageCommentsNum = () =>{
        return new Promise((() => {
            let query = MessageCommentsModel.find({});
            if(bodyParams._messageCommentsId){
                if(bodyParams._messageCommentsId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._messageCommentsId));
                }else{
                    logger.info('createMessageComments updateMessageCommentsNum _messageCommentsId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
                    return next();
                }
            }
            MessageCommentsModel.findOneAndUpdate(query,{ $inc: { commentsNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createMessageComments updateMessageCommentsNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMessageComments updateMessageCommentsNum ' + 'success');
                    resUtil.resetCreateRes(res,returnMessage);
                    return next();
                }
            });
        }));
    }
    saveMessageComments()
        .then(updateUserNumber)
        .then(()=>{
            if(bodyParams.level == sysConsts.COUMMENT.level.firstCoumment){
                //一级评论
                updateMessageNum();
            }else{
                //二级评论
                updateMessageCommentsNum();
            }
        })
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
    let path = req.params;
    let query = MessageCommentsModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
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
const deleteComments = (req, res, next) => {
    let path = req.path;
    let query = MessageModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('deleteComments userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('deleteComments messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    MessageModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteComments ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteComments ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const getMessageCommentsByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "messages_infos",
                localField: "_messageId",
                foreignField: "_id",
                as: "messages_info"
            }
        },
        {
            $lookup: {
                from: "user_infos",
                localField: "_userId",
                foreignField: "_id",
                as: "user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_userId",
                foreignField: "_userId",
                as: "user_detail_info"
            }
        }
    );

    if(params.messageCommentsId){
        if(params.messageCommentsId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.messageCommentsId);
        }else{
            logger.info('getMessageCommentsByAdmin  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            matchObj._messageId = mongoose.mongo.ObjectId(params.messagesId);
        }else{
            logger.info('getMessageCommentsByAdmin  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userId && (params.phone == '' || params.phone == null ||  params.phone == "undefined")){
        if(params.userId.length == 24){
            matchObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getMessageCommentsByAdmin  _userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if (params.type){
        matchObj.messages_type = Number(params.type);
    }
    if (params.status){
        matchObj.status = Number(params.status);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj["created_at"] = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    //根据phone查询用户ID
    const getUserId = () =>{
        return new Promise((resolve, reject) => {
            //判断查询条件中 是否存在电话号
            if(params.phone){
                let query = UserModel.find({});
                if(params.phone){
                    query.where('phone').equals(params.phone);
                }
                query.exec((error,rows)=> {
                    if (error) {
                        logger.error(' getMessageCommentsByAdmin getUserId ' + error.message);
                        resUtil.resInternalError(error,res);
                    } else {
                        logger.info(' getMessageCommentsByAdmin getUserId ' + 'success');
                        if(params.userId){
                            if(mongoose.mongo.ObjectId(params.userId) == rows[0]._doc._id){
                                matchObj._userId = mongoose.mongo.ObjectId(params.userId);
                            }
                        }else{
                            matchObj._userId = mongoose.mongo.ObjectId(rows[0]._doc._id);
                        }
                        resolve();
                    }
                });
            }else{
                resolve();
            }
        });
    }
    const getComment =()=>{
        return new Promise((resolve, reject) => {
            aggregate_limit.push({
                $match: matchObj
            });

            if (params.start && params.size){
                aggregate_limit.push(
                    {
                        $skip : Number(params.start)
                    },{
                        $limit : Number(params.size)
                    }
                );
            };

            aggregate_limit.push({
                $project: {
                    "user_login_info.password": 0
                }
            });

            MessageCommentsModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' getMessageCommentsByAdmin getComment ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getMessageCommentsByAdmin getComment ' + 'success');
                    resUtil.resetQueryRes(res, rows);
                    return next();
                }
            });
        });
    }
    getUserId()
        .then(getComment)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })

}
const getMessageCommentsCountByAdmin = (req, res, next) => {
    let query = MessageCommentsModel.find({});
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getMessageCommentsCountByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMessageCommentsCountByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getMessageCommentsTodayCountByAdmin = (req, res, next) => {
    let aggregate_limit = [];
    let today = new Date();
    let startDay = new Date(moment(today).format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).add(1, 'days').format('YYYY-MM-DD'));
    aggregate_limit.push(
        {
            $lookup: {
                from: "messages_infos",
                localField: "_messageId",
                foreignField: "_id",
                as: "messages_info"
            }
        }
    );
    if(startDay && endDay){
        aggregate_limit.push({
            $match: {
                created_at :  {$gte: startDay,$lt: endDay}
            }
        });
    }
    aggregate_limit.push({
        $group: {
            _id: {type:"$messages_info.type"},
            count:{$sum:1}
        }
    });
    MessageCommentsModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getMessageCommentsTodayCountByAdmin getComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getMessageCommentsTodayCountByAdmin getComment ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });

}
const updateStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    let query = MessageCommentsModel.find({});
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('updateStatusByAdmin  messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const deleteCommentsByAdmin = (req, res, next) => {
    let path = req.params;
    let query = MessageCommentsModel.find({});
    if(path.messageCommentsId){
        if(path.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.messageCommentsId));
        }else{
            logger.info('deleteCommentsByAdmin messageCommentsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENTS_ID_NULL_ERROR);
            return next();
        }
    }
    MessageCommentsModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteCommentsByAdmin ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteCommentsByAdmin ' + 'success');
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
    deleteComments,
    getMessageCommentsByAdmin,
    getMessageCommentsCountByAdmin,
    getMessageCommentsTodayCountByAdmin,
    updateStatusByAdmin,
    deleteCommentsByAdmin
};