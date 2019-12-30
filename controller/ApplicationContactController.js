"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('ApplicationContactController');

const {ApplicationContactModel} = require('../modules');

const getApplicationContact = (req, res, next) => {
    let params = req.query;
    let query = ApplicationContactModel.find({});
    if(params.beInvitedUserId){
        if(params.beInvitedUserId.length == 24){
            query.where('_beInvitedUserId').equals(mongoose.mongo.ObjectId(params.beInvitedUserId));
        }else{
            logger.info('getApplicationContact beInvitedUserId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
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
            logger.error(' getApplicationContact ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getApplicationContact ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getApplicationContactByAdmin = (req, res, next) => {
    let params = req.query;
    let query = ApplicationContactModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getApplicationContact userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.beInvitedUserId){
        if(params.beInvitedUserId.length == 24){
            query.where('_beInvitedUserId').equals(mongoose.mongo.ObjectId(params.beInvitedUserId));
        }else{
            logger.info('getApplicationContact beInvitedUserId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
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
            logger.error(' getApplicationContact ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getApplicationContact ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createApplicationContact = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let voteObj = bodyParams;
    voteObj.status = 0;
    if(path.userId){
        if(path.userId.length == 24){
            voteObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createApplicationContact userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userId){
        if(path.userId.length == 24){
            voteObj._userId = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createApplicationContact userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let voteModel = new ApplicationContactModel(voteObj);
    voteModel.save(function(error,result){
        if (error) {
            logger.error(' createApplicationContact ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createApplicationContact ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = ApplicationContactModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_beInvitedUserId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateStatus userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    ApplicationContactModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatus ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getApplicationContact,
    getApplicationContactByAdmin,
    createApplicationContact,
    updateStatus
};