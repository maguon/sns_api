"use strict"

const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const sysConsts = require('../util/SystemConst');
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
    let appObj = bodyParams

    let appModel = new AppModel(appObj)
    appModel.save(function(error,result){
        if (error) {
            logger.error(' createApp ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createApp ' + 'success');
            resUtil.resetCreateRes(res, result);
        }
    })
}
const updateApp = (req, res, next) =>{
    let bodyParams = req.body;
    let query = AppModel.find();
    let params = req.params;
    if(params.appId){
        if(params.appId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.appId));
        }else{
            logger.info('updateApp appId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    AppModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateApp ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateApp ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}

module.exports = {
    getApp,
    createApp,
    updateApp
};