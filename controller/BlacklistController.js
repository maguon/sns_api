"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('BlacklistController');

const {BlacklistModel} = require('../modules');

const getBlacklistByUser = (req, res, next) => {
    let path = req.path;
    let params = req.query;
    let query = BlacklistModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getBlacklistByUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getBlacklistByUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getBlacklistByUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getBlacklistByAdmin = (req, res, next) => {
    let params = req.query;
    let query = BlacklistModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getBlacklistByAdmin  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.blacklistId){
        if(params.blacklistId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.blacklistId));
        }else{
            logger.info('getBlacklistByAdmin  blacklistId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.BLACK_LIST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getBlacklistByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getBlacklistByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createBlacklist = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let blacklistObj = bodyParams;
    if(params.userId){
        if(params.userId.length == 24){
            blacklistObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createBlacklist userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let notificationSettingsModel = new BlacklistModel(blacklistObj);
    notificationSettingsModel.save(function(error,result){
        if (error) {
            logger.error(' createBlacklist ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createBlacklist ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
module.exports = {
    getBlacklistByUser,
    getBlacklistByAdmin,
    createBlacklist
};