"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('AddressCollectionsController');

const {AddressCollectionsModel} = require('../modules');

const getAddressCollections = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = AddressCollectionsModel.find({status:sysConsts.INFO_STATUS.Status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAddressCollections  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.addressCollectionsId){
        if(params.addressCollectionsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.addressCollectionsId));
        }else{
            logger.info('getAddressCollections  addressCollectionsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.ADDRESS_COLLECTIONS_ID_NULL);
            return next();
        }
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAddressCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAddressCollections ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createAddressCollections = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let addressCollectionsObj = bodyParams;
    if(path.userId){
        if(path.userId.length == 24){
            addressCollectionsObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createAddressCollections  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let addressCollectionsModel = new AddressCollectionsModel(addressCollectionsObj);
    addressCollectionsModel.save(function(error,result){
        if (error) {
            logger.error(' createAddressCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createAddressCollections ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateMessageStatus = (req, res, next) => {
    let params = req.params;
    let queryMessge = MessageModel.find({});
    let queryComments = CommentsModel.find({});
    let queryCommentsTwo = CommentsTwoModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            queryMessge.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('deleteMessageToUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.messagesId){
        if(params.messagesId.length == 24){
            queryMessge.where('_id').equals(mongoose.mongo.ObjectId(params.messagesId));
            queryComments.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
            queryCommentsTwo.where('_messageId').equals(mongoose.mongo.ObjectId(params.messagesId));
        }else{
            logger.info('deleteMessageToUser  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }

    const updateMessage = ()=>{
        return new Promise(((resolve, reject) => {
            MessageModel.updateOne(queryMessge,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' deleteMessageToUser updateMessage ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' deleteMessageToUser updateMessage ' + 'success');
                    console.log('rows:',result);
                    resolve(result);
                }
            })
        }));
    }
    const updateReview = (resultInfo)=>{
        return new Promise(((resolve, reject) => {
            //同时删除该消息下的所有一級评论
            CommentsModel.updateMany(queryComments,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' deleteMessageToUser updateReview ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' deleteMessageToUser updateReview ' + 'success');
                    resolve(resultInfo);
                }
            })
        }));
    }
    const updateReviewTwo = (resultInfo) =>{
        return new Promise(()=>{
            CommentsTwoModel.updateMany(queryCommentsTwo,{status:sysConsts.INFO_STATUS.Status.disable},function(error,result){
                if (error) {
                    logger.error(' deleteMessageToUser updateReviewTwo ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' deleteMessageToUser updateReviewTwo ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,resultInfo,null);
                    return next();
                }
            })
        });
    }
    updateMessage()
        .then(updateReview)
        .then(updateReviewTwo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
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
module.exports = {
    getAddressCollections,
    createAddressCollections,
    updateMessageStatus,
    searchByRadius
};