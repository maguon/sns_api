"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('PrivacySettingsController');

const {PrivacySettingsModel} = require('../modules');

const getPrivacySettings = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = PrivacySettingsModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getPrivacySettings  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getPrivacySettings ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getPrivacySettings ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createPrivacySettings = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let privacySettingsObj = bodyParams;
    if(params.userId){
        if(params.userId.length == 24){
            privacySettingsObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createPrivacySettings userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let privacySettingsModel = new PrivacySettingsModel(privacySettingsObj);
    privacySettingsModel.save(function(error,result){
        if (error) {
            logger.error(' createPrivacySettings ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createPrivacySettings ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updatePrivacySettings = (req, res, next) => {
    let bodyParams = req.body;
    let query = PrivacySettingsModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updatePrivacySettings userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.privacySettingsId){
        if(params.privacySettingsId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.privacySettingsId ));
        }else{
            logger.info('updatePrivacySettings privacySettingsId  format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    PrivacySettingsModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updatePhone updateUserPhone ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updatePhone  updateUserPhone ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })

}
module.exports = {
    getPrivacySettings,
    createPrivacySettings,
    updatePrivacySettings
};