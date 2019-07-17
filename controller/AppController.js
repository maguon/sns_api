"use strict"

const resUtil = require('../util/ResponseUtil');

const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('AppController');

const {AppModel} = require('../modules');




const getApp = (req, res, next) => {
    let params = req.query;
    let query = AppModel.find({});

    if(params.appId){
        query.where('_id').equals(params.appId);
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

const  createApp = (req, res, next) => {
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


module.exports = {
    getApp,createApp
};