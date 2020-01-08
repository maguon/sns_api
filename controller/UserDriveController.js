"use strict"
const mongoose = require('mongoose');
const systemMsg = require('../util/SystemMsg');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserDriveController');

const {UserDriveModel} = require('../modules');

const getUserDrive = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserDriveModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserDrive  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userDriveId){
        if(params.userDriveId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userDriveId));
        }else{
            logger.info('getUserDrive  userDriveId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.USER_DRIVE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.sex){
        query.where('sex').equals(params.sex);
    }
    if(params.truename){
        query.where('truename').equals(params.truename);
    }
    if(params.drivingType){
        query.where('drivingType').equals(params.drivingType);
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserDrive ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserDrive ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const updateUserDriveInfo = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDriveModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateUserDriveInfo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userDetailId){
        if(path.userDetailId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userDetailId));
        }else{
            logger.info('updateUserDriveInfo  userDetailID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.USER_ID_NULL_ERROR);
            return next();
        }
    }
    if(bodyParams.drivingType){
        bodyParams.driving_type = bodyParams.drivingType;
    }
    if(bodyParams.certificationDate){
        bodyParams.certification_date = bodyParams.certificationDate;
    }
    UserDriveModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserDriveInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserDriveInfo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}

module.exports = {
    getUserDrive,
    updateUserDriveInfo
};