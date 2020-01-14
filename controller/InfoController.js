"use strict"

const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const sysConsts = require('../util/SystemConst');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('InfoController');

const {InfoModel} = require('../modules');

const getInfo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = InfoModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('content._user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateApp userId format incorrect!');
            resUtil.resetQueryRes(res,[],systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.infoId){
        if(params.infoId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.infoId));
        }else{
            logger.info('updateApp infoId format incorrect!');
            resUtil.resetQueryRes(res,[],systemMsg.INFO_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getInfo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getInfo ' + 'success');
            resUtil.resetQueryRes(res, rows);
        }
    });
}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = InfoModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('content._user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateStatus  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }

    if(path.type){
        query.where('type').equals(path.type);
    }else{
        logger.info('updateStatus  type format incorrect!');
        resUtil.resetUpdateRes(res,null,[]);
        return next();
    }
    InfoModel.updateMany(query,{status:sysConsts.INFO.status.read},function(error,result){
        if (error) {
            logger.error(' updateStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getInfo,
    updateStatus
};