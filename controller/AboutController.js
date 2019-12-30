"use strict"

const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const sysConsts = require('../util/SystemConst');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('AboutController');
const {AboutModel} = require('../modules');

const getAbout = (req, res, next) => {
    let params = req.query;
    let query = AboutModel.find({});
    if(params.aboutId){
        if(params.aboutId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.aboutId));
        }else{
            logger.info('getAbout aboutId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAbout ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAbout ' + 'success');
            resUtil.resetQueryRes(res, rows);
        }
    });
}
const createAbout = (req, res, next) => {
    let bodyParams = req.body;
    let aboutObj = bodyParams
    let aboutModel = new AboutModel(aboutObj)
    aboutModel.save(function(error,result){
        if (error) {
            logger.error(' createAbout ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createAbout ' + 'success');
            resUtil.resetCreateRes(res, result);
        }
    })
}
const updateAbout = (req, res, next) =>{
    let bodyParams = req.body;
    let query = AboutModel.find();
    let path = req.params;
    if(path.aboutId){
        if(path.aboutId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.aboutId));
        }else{
            logger.info('updateAbout aboutId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    AboutModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAbout ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAbout ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const deleteAbout = (req, res, next) => {
    let path = req.path;
    let query = AboutModel.find({});
    if(path.aboutId){
        if(path.appId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.aboutId));
        }else{
            logger.info(' deleteAbout aboutId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.ABOUT_ID_NULL_ERROR);
            return next();
        }
    }
    AboutModel.deleteOne(query,function(error,result){
        if(error){
            logger.error(' deleteAbout ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info(' deleteAbout ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getAbout,
    createAbout,
    updateAbout,
    deleteAbout
};