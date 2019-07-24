"use strict"

const resUtil = require('../util/ResponseUtil');
const encrypt = require('../util/Encrypt.js');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserDetailController');

const {UserDetailModel} = require('../modules');


const getUserDetail = (req, res, next) => {
    let params = req.query;
    let query = UserDetailModel.find({});

    if(params.userDetailId){
        query.where('_id').equals(params.userDetailId);
    }
    if(params._userId){
        query.where('_userId').equals(params._userId);
    }
    if(params.sex){
        query.where('sex').equals(params.sex);
    }
    if(params.birthday){
        query.where('birthday').equals(params.birthday);
    }
    if(params.realmname){
        query.where('realmname').equals(params.realmname);
    }
    if(params.intro){
        query.where('intro').equals(params.intro);
    }
    if(params.label){
        query.where('label').equals(params.label);
    }
    if(params.truename){
        query.where('truename').equals(params.truename);
    }
    if(params.avatar){
        query.where('avatar').equals(params.avatar);
    }
    if(params.drivingtype){
        query.where('drivingtype').equals(params.drivingtype);
    }

    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserDetail ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserDetail ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}

//根据用户详细信息ID，对信息进行修改
const  updateUserDetailInfo = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDetailModel.find({});
    let params = req.params;

    if(params.userDetailId){
        query.where('_id').equals(params.userDetailId);
    }

    UserDetailModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserDetailInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserDetailInfo ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
//根据用户ID，对信息进行修改
const  updateAccordingToUserID = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDetailModel.find({});
    let params = req.params;

    if(params.userId){
        query.where('_userId').equals(params.userId);
    }

    UserDetailModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAccordingToUserID ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAccordingToUserID ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}

module.exports = {
    getUserDetail,
    updateUserDetailInfo,
    updateAccordingToUserID
};