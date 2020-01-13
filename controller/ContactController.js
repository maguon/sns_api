"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('ContactController');

const {ContactModel} = require('../modules');

const getContact = (req, res, next) => {
    let params = req.query;
    let query = ContactModel.find({});
    if(params.beInvitedUserId){
        if(params.beInvitedUserId.length == 24){
            query.where('_be_invited_user_id').equals(mongoose.mongo.ObjectId(params.beInvitedUserId));
        }else{
            logger.info('getContact beInvitedUserId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.contactId){
        if(params.contactId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.contactId));
        }else{
            logger.info('getContact contactId format incorrect!');
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
            logger.error(' getContact ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getContact ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getContactByAdmin = (req, res, next) => {
    let params = req.query;
    let query = ContactModel.find({});
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getContact userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.beInvitedUserId){
        if(params.beInvitedUserId.length == 24){
            query.where('_be_invited_user_id').equals(mongoose.mongo.ObjectId(params.beInvitedUserId));
        }else{
            logger.info('getContact beInvitedUserId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.contactId){
        if(params.contactId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.contactId));
        }else{
            logger.info('getContact contactId format incorrect!');
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
            logger.error(' getContact ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getContact ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createContact = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let contactObj = bodyParams;
    contactObj.status = 0;
    if(path.userId){
        if(path.userId.length == 24){
            contactObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createContact userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(bodyParams.beInvitedUserId){
        if(bodyParams.beInvitedUserId.length == 24){
            contactObj._be_invited_user_id = mongoose.mongo.ObjectId(bodyParams.beInvitedUserId);
        }else{
            logger.info('createContact beInvitedUserId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let contactModel = new ContactModel(contactObj);
    contactModel.save(function(error,result){
        if (error) {
            logger.error(' createContact ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createContact ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = ContactModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_be_invited_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateStatus userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    ContactModel.updateOne(query,bodyParams,function(error,result){
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
    getContact,
    getContactByAdmin,
    createContact,
    updateStatus
};