"use strict"

const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('MessageController');

const {MessageModel} = require('../modules');

const getMessage = (req, res, next) => {
    let params = req.query;
    let query = MessageModel.find({status:1});

    if(params.messagesId){
        query.where('_id').equals(params.messagesId);
    }
    if(params.userId){
        query.where('_userId').equals(params.userId);
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
    let bodyParams = req.body;
    let messageObj = bodyParams;

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
        query.where('_userId').equals(params.userId);
    }
    if(params.messagesId){
        query.where('_id').equals(params.messagesId);
    }
    MessageModel.deleteOne(query,function(error,result){
        if (error) {
            logger.error(' deleteMessageToUser ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' deleteMessageToUser ' + 'success');
            resUtil.resetQueryRes(res,result,null);
            return next();
        }
    })

}
const updateMessageStatusToAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let query = MessageModel.find({});
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
    let query = MessageModel.find({});
    let params = req.params;
    if(params.userId){
        query.where('_userId').equals(params.userId);
    }
    if(params.messagesId){
        query.where('_id').equals(params.messagesId);
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
    let query = MessageModel.find({ 'address' : { $geoWithin :{ $center : [ arr , params.radius ] }},status:1}).skip(skipnum).limit(pageSize).sort(sort);
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