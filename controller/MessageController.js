"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MessageController');

const {MessageModel} = require('../modules');

const getMessage = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = MessageModel.find({status:sysConsts.INFO.status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getMessage  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('getMessage  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getMessage ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMessage ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getMessageCount = (req, res, next) => {
    let path = req.params;
    let aggregate_limit = [];
    if(path.userId){
        if(path.userId.length == 24){
            aggregate_limit.push({
                $match: {
                    _userId :  mongoose.mongo.ObjectId(path.userId)
                }
            });
        }else{
            logger.info('getMessageCount userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    aggregate_limit.push({
        $group: {
            _id: {type:"$type"},
            count:{$sum:1}
        }
    });

    MessageModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getMessageCount ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getMessageCount ' + 'success');

            let total = 0;
            for (let num in rows) {
                total += rows[num].count;
            }
            let returnMsg = {
                groupCount: rows,
                countSum: total
            }
            resUtil.resetQueryRes(res, returnMsg);
            return next();
        }
    });
}
const createMessage = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let messageObj = bodyParams;
    messageObj.status = sysConsts.INFO.status.available;
    messageObj.comment_status = sysConsts.MESSAGE.comment_status.visible;
    messageObj.collectNum = 0;
    messageObj.commentsNum = 0;
    messageObj.agreeNum = 0;
    messageObj.readNum = 0;
    if(path.userId){
        if(path.userId.length == 24){
            messageObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createMessage  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let messageModel = new MessageModel(messageObj);
    messageModel.save(function(error,result){
        if (error) {
            logger.error(' createMessage ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createMessage ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateMessageStatus = (req, res, next) => {
    let params = req.params;
    let queryMessge = MessageModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            queryMessge.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateMessageStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            queryMessge.where('_id').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('updateMessageStatus  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    MessageModel.updateOne(queryMessge,{status:sysConsts.INFO.status.disable},function(error,result){
        if (error) {
            logger.error(' updateMessageStatus updateMessage ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateMessageStatus updateMessage ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const searchByRadius = (req, res, next) => {
    let params = req.query;
    let arr =[];
    let str=params.address.slice(1,params.address.length-1);
    arr = str.split(',');
    let sort = {'updated_at':-1};                              //排序（按登录时间倒序）
    let query = MessageModel.find({ 'address' : { $geoWithin :{ $center : [ arr , params.radius ] }},status:1}).sort(sort);
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error, rows)=> {
        if (error) {
            logger.error(' SearchByRadius ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' SearchByRadius ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const deleteMessage = (req, res, next) => {
    let path = req.path;
    let query = MessageModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('deleteMessage userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.messagesId){
        if(path.messagesId.length == 24){
            query._id = mongoose.mongo.ObjectId(path.messagesId);
        }else{
            logger.info('deleteMessage messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    MessageModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteMessage ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteMessage ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getMessage,
    getMessageCount,
    createMessage,
    updateMessageStatus,
    searchByRadius,
    deleteMessage
};