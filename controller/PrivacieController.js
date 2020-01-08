"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('PrivacieController');

const {PrivacieModel} = require('../modules');

const getPrivacieByUser = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = PrivacieModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getPrivacieByUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getPrivacieByUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getPrivacieByUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getPrivacieByAdmin = (req, res, next) => {
    let params = req.query;
    let query = PrivacieModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getPrivacieByAdmin  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.privacieId){
        if(params.privacieId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.privacieId));
        }else{
            logger.info('getPrivacieByAdmin  privacieId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRIVACY_SETTINGS_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getPrivacieByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getPrivacieByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const updatePrivacie = (req, res, next) => {
    let bodyParams = req.body;
    let query = PrivacieModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updatePrivacie userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(path.privacieId){
        if(path.privacieId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.privacieId ));
        }else{
            logger.info('updatePrivacie privacieId  format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(bodyParams.recommendToFriends){
        bodyParams.recommend_to_friends = bodyParams.recommendToFriends;
    }
    if(bodyParams.msgAuthority){
        bodyParams.msg_authority = bodyParams.msgAuthority;
    }
    PrivacieModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updatePrivacie ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updatePrivacie  ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getPrivacieByUser,
    getPrivacieByAdmin,
    updatePrivacie
};