"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('MessageController');

const {MessageModel} = require('../modules');

const getMessage = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = MessageModel.find({status:1,del_status:0});
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
    if(params.info){
        query.where('info').equals(params.info);
    }
    if(params.collectnum){
        query.where('collectnum').equals(params.collectnum);
    }
    if(params.commentnum){
        query.where('commentnum').equals(params.commentnum);
    }
    if(params.agreenum){
        query.where('agreenum').equals(params.agreenum);
    }
    if(params.readnum){
        query.where('readnum').equals(params.readnum);
    }
    if(params.label){
        query.where('label').equals(params.label);
    }
    if(params.Multi_Media){
        query.where('Multi_Media').equals(params.Multi_Media);
    }
    if(params.status){
        query.where('status').equals(params.status);
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
const createMessage = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let messageObj = bodyParams;
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
const deleteMessageToUser = (req, res, next) => {
    let params = req.params;
    let query = MessageModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('deleteMessageToUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('deleteMessageToUser  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    MessageModel.updateOne(query,{del_status:1},function(error,result){
        if (error) {
            logger.error(' deleteMessageToUser ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' deleteMessageToUser ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })

    // MessageModel.deleteOne(query,function(error,result){
    //     if (error) {
    //         logger.error(' deleteMessageToUser ' + error.message);
    //         resUtil.resInternalError(error);
    //     } else {
    //         logger.info(' deleteMessageToUser ' + 'success');
    //         resUtil.resetQueryRes(res,result,null);
    //         return next();
    //     }
    // })
}
const updateMessageStatusToAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let query = MessageModel.find({del_status:0});
    let params = req.params;
    //判断此管理员是否有权限修改----暂无
    if(params.adminId){
        console.log(params.adminId);
    }
    if(params.messagesId){
        query.where('_id').equals(params.messagesId);
    }
    MessageModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateMessageStatusToAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateMessageStatusToAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const updateMessageStatusToUser = (req, res, next) => {
    let bodyParams = req.body;
    let query = MessageModel.find({del_status:1});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateMessageStatusToUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.userId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('updateMessageStatusToUser  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    MessageModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateMessageStatusToUser ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateMessageStatusToUser ' + 'success');
            console.log('rows:',result);
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
    let  pageSize = Number(params.pageSize);                   //一页多少条
    let currentPage = Number(params.currentPage);              //当前第几页
    let sort = {'updated_at':-1};                              //排序（按登录时间倒序）
    let skipnum = (currentPage - 1) * pageSize;                 //跳过数
    let query = MessageModel.find({ 'address' : { $geoWithin :{ $center : [ arr , params.radius ] }},status:1,del_status:0}).skip(skipnum).limit(pageSize).sort(sort);
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
module.exports = {
    getMessage,
    createMessage,
    deleteMessageToUser,
    updateMessageStatusToAdmin,
    updateMessageStatusToUser,
    searchByRadius
};