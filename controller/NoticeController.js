"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('NoticeController');

const {NoticeModel} = require('../modules');

const getNoticeByUser = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = NoticeModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getNoticeByUser  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getNoticeByUser ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNoticeByUser ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getNoticeByAdmin = (req, res, next) => {
    let params = req.query;
    let query = NoticeModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getNoticeByAdmin  userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.noticeId){
        if(params.noticeId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.noticeId));
        }else{
            logger.info('getNoticeByAdmin  noticeId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getNoticeByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNoticeByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const updateNotice = (req, res, next) => {
    let bodyParams = req.body;
    let query = NoticeModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateNotice userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(path.noticeId){
        if(path.noticeId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.noticeId ));
        }else{
            logger.info('updateNotice noticeId  format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(bodyParams.followAddmsg != undefined){
        bodyParams.follow_addmsg = bodyParams.followAddmsg;
    }
    NoticeModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateNotice ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateNotice  ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })

}
module.exports = {
    getNoticeByUser,
    getNoticeByAdmin,
    updateNotice
};