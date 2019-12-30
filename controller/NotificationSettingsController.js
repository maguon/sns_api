"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('NotificationSettingsController');

const {NotificationSettingsModel} = require('../modules');

const getNotificationSettingsByUser = (req, res, next) => {
    let path = req.path;
    let params = req.query;
    let query = NotificationSettingsModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getNotificationSettingsByUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getNotificationSettingsByUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNotificationSettingsByUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getNotificationSettingsByAdmin = (req, res, next) => {
    let params = req.query;
    let query = NotificationSettingsModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getNotificationSettingsByAdmin  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.notificationSettingsId){
        if(params.notificationSettingsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.notificationSettingsId));
        }else{
            logger.info('getNotificationSettingsByAdmin  notificationSettingsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRIVACY_SETTINGS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getNotificationSettingsByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNotificationSettingsByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const updateNotificationSettings = (req, res, next) => {
    let bodyParams = req.body;
    let query = NotificationSettingsModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateNotificationSettings userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.notificationSettingsId){
        if(params.notificationSettingsId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.notificationSettingsId ));
        }else{
            logger.info('updateNotificationSettings privacySettingsId  format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    NotificationSettingsModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateNotificationSettings ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateNotificationSettings  ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })

}
module.exports = {
    getNotificationSettingsByUser,
    getNotificationSettingsByAdmin,
    updateNotificationSettings
};