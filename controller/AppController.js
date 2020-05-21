"use strict"

const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const sysConsts = require('../util/SystemConst');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('AppController');

const {AppModel} = require('../modules');

const getApp = (req, res, next) => {
    let params = req.query;
    let query = AppModel.find({});

    if(params.appId){
        if(params.appId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.appId));
        }else{
            logger.info('updateApp appId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.appType){
        query.where('app_type').equals(params.appType);
    }
    if(params.deviceType){
        query.where('device_type').equals(params.deviceType);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getApp ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getApp ' + 'success');
            resUtil.resetQueryRes(res, rows);
        }
    });
}
const createApp = (req, res, next) => {
    let bodyParams = req.body;
    let appObj = bodyParams;
    appObj.status = sysConsts.APP.status.available;
    if(bodyParams.appType){
        appObj.app_type  = bodyParams.appType;
    }
    if(bodyParams.deviceType){
        appObj.device_type  = bodyParams.deviceType;
    }
    if(bodyParams.versionNum){
        appObj.version_num  = bodyParams.versionNum;
    }
    if(bodyParams.minVersionNum){
        appObj.min_version_num  = bodyParams.minVersionNum;
    }
    if(bodyParams.forceUpdate != undefined){
        appObj.force_update  = bodyParams.forceUpdate;
    }
    let appModel = new AppModel(appObj)
    appModel.save(function(error,result){
        if (error) {
            logger.error(' createApp ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createApp ' + 'success');
            resUtil.resetCreateRes(res, result);
        }
    });
}
const updateApp = (req, res, next) =>{
    let bodyParams = req.body;
    let query = AppModel.find();
    let path = req.params;
    if(path.appId){
        if(path.appId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.appId));
        }else{
            logger.info('updateApp appId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(bodyParams.appType){
        bodyParams.app_type  = bodyParams.appType;
    }
    if(bodyParams.deviceType){
        bodyParams.device_type  = bodyParams.deviceType;
    }
    if(bodyParams.versionNum){
        bodyParams.version_num  = bodyParams.versionNum;
    }
    if(bodyParams.minVersionNum){
        bodyParams.min_version_num  = bodyParams.minVersionNum;
    }
    if(bodyParams.forceUpdate != undefined){
        bodyParams.force_update  = bodyParams.forceUpdate;
    }
    AppModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateApp ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateApp ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = AppModel.find({});
    let path = req.params;
    if(path.appId){
        if(path.appId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.appId));
        }else{
            logger.info('updateStatus  ID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.APP_ID_NULL_ERROR);
            return next();
        }
    }
    AppModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const deleteApp = (req, res, next) => {
    let path = req.params;
    let query = AppModel.find({});
    if(path.appId){
        if(path.appId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.appId));
        }else{
            logger.info(' deleteApp appId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.APP_ID_NULL_ERROR);
            return next();
        }
    }
    AppModel.deleteOne(query,function(error,result){
        if(error){
            logger.error(' deleteApp ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info(' deleteApp ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
module.exports = {
    getApp,
    createApp,
    updateApp,
    updateStatus,
    deleteApp
};