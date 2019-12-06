"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserLocationCollectionsController');

const {UserLocationCollectionsModel} = require('../modules');

const getUserLocationCollections = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = UserLocationCollectionsModel.find({status:sysConsts.INFO.status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserLocationCollections  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userLocationCollectionsId){
        if(params.userLocationCollectionsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userLocationCollectionsId));
        }else{
            logger.info('getUserLocationCollections  userLocationCollectionsId format incorrect!');
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
            logger.error(' getUserLocationCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserLocationCollections ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserLocationCollections = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userLocationCollectionsObj = bodyParams;
    userLocationCollectionsObj.status = sysConsts.INFO.status.available;
    if(path.userId){
        if(path.userId.length == 24){
            userLocationCollectionsObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createUserLocationCollections  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let userLocationCollectionsModel = new UserLocationCollectionsModel(userLocationCollectionsObj);
    userLocationCollectionsModel.save(function(error,result){
        if (error) {
            logger.error(' createUserLocationCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createUserLocationCollections ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = UserLocationCollectionsModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userLocationCollectionId){
        if(params.userLocationCollectionId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userLocationCollectionId));
        }else{
            logger.info('updateStatus  userLocationCollectionId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    UserLocationCollectionsModel.updateOne(query,bodyParams,function(error,result){
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
    getUserLocationCollections,
    createUserLocationCollections,
    updateStatus
};