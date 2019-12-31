"use strict"

const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const oauthUtil = require('../util/OAuthUtil.js');
const encrypt = require('../util/Encrypt.js');
const dateUtil = require('../util/DateUtil.js');
const https = require('https');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const smsConfig = require('../config/SmsConfig');
const logger = serverLogger.createLogger('SmsController');

const {UserModel} = require('../modules');

const httpSend = (msg, callback) => {
    let d = new Date();
    let timeStampStr = dateUtil.getDateFormat(d, 'yyyyMMddhhmmss');

    let originSignStr = smsConfig.smsOptions.accountSID + smsConfig.smsOptions.accountToken + timeStampStr;
    let signature = encrypt.encryptByMd5NoKey(originSignStr);

    let originAuthStr = smsConfig.smsOptions.accountSID + ":" + timeStampStr;
    let auth = encrypt.base64Encode(originAuthStr);
    let url = "/2013-12-26/" + smsConfig.smsOptions.accountType + "/" +
        smsConfig.smsOptions.accountSID + "/" + smsConfig.smsOptions.action + "?sig=";

    url = url + signature;
    let postData = JSON.stringify(msg);
    let options = {
        host: smsConfig.smsOptions.server,
        port: smsConfig.smsOptions.port,
        path: url,
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf8',
            'Content-Length': Buffer.byteLength(postData, 'utf8'),
            'Authorization': auth
        }
    };

    let httpsReq = https.request(options, function (result) {
        let data = "";
        result.setEncoding('utf8');
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            let resObj = eval("(" + data + ")");
            logger.info("httpSend " + resObj);
            callback(null, resObj);
        }).on('error', function (e) {
            logger.error("httpSend " + e.message);
            callback(e, null);
        });

    });

    httpsReq.write(postData + "\n", 'utf-8');
    httpsReq.end();
    httpsReq.on('error', function (e) {
        callback(e, null)
    });
}

const sendSms = (params, callback) =>{
    let msg = {
        to: params.phone,
        appId: smsConfig.smsOptions.appSID,
        templateId: params.templateId,
        datas: [params.captcha, '15']
    };
    httpSend(msg, callback);
}
//验证用户不存在，发送验证码
const regSms = (req,res,next) =>{
    let path = req.params;
    let captcha = ""

    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUser = UserModel.find({});
            if(path.phone){
                queryUser.where('phone').equals(path.phone);
            }
            queryUser.exec((error,rows)=> {
                if (error) {
                    logger.error(' regSms getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' regSms getUserPhone ' + 'success');
                    if(rows.length > 0){
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }else{
                        resolve();
                    }
                }
            });
        });
    }

    const savePhoneCode = () =>{
        return new Promise((resolve, reject) => {
            captcha = encrypt.getSmsRandomKey();
            console.log(captcha);
            oauthUtil.saveUserPhoneCode({phone:path.phone,code:captcha},function(error,result){
                if (error) {
                    logger.error(' regSms savePhoneCode ' + error.message);
                    reject({err:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else {
                    logger.info(' regSms savePhoneCode ' + 'success');
                    resolve();
                }
            })
        });
    }

    const sendPhoneSms = () =>{
        return new Promise((resolve, reject) => {
            sendSms({phone:path.phone,captcha:captcha,templateId:smsConfig.smsOptions.signTemplateId},function (error,result) {
                if (error) {
                    logger.error(' regSms sendPhoneSms ' + error.message);
                    reject({err:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else {
                    logger.info(' regSms sendPhoneSms ' + 'success');
                    resUtil.resetCreateRes(res,{_id:1},null);
                    return next();
                }
            })
        });
    }

    getUserPhone()
        .then(savePhoneCode)
        .then(sendPhoneSms)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
//验证用户存在，发送验证码
const passwordSms = (req,res,next) =>{
    let path = req.params;
    let captcha = ""

    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUser = UserModel.find({});
            if(path.phone){
                queryUser.where('phone').equals(path.phone);
            }
            queryUser.exec((error,rows)=> {
                if (error) {
                    logger.error(' passwordSms getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' passwordSms getUserPhone ' + 'success');
                    if(rows.length > 0){
                        resolve();
                    }else{
                        reject({msg:systemMsg.USER_SIGNUP_PHONE_REGISTERED});
                    }
                }
            });
        });
    }

    const savePhoneCode = () =>{
        return new Promise((resolve, reject) => {
            captcha = encrypt.getSmsRandomKey();
            console.log(captcha);
            oauthUtil.saveUserPhoneCode({phone:path.phone,code:captcha},function(error,result){
                if (error) {
                    logger.error(' passwordSms savePhoneCode ' + error.message);
                    reject({err:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else {
                    logger.info(' passwordSms savePhoneCode ' + 'success');
                    resolve();
                }
            })
        });
    }

    const sendPhoneSms = () =>{
        return new Promise((resolve, reject) => {
            sendSms({phone:path.phone,captcha:captcha,templateId:smsConfig.smsOptions.signTemplateId},function (error,result) {
                if (error) {
                    logger.error(' passwordSms sendPhoneSms ' + error.message);
                    reject({err:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else {
                    logger.info(' passwordSms sendPhoneSms ' + 'success');
                    resUtil.resetCreateRes(res,{_id:1},null);
                    return next();
                }
            })
        });
    }

    getUserPhone()
        .then(savePhoneCode)
        .then(sendPhoneSms)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
//验证用户存在，发送验证码
const resetSms = (req, res, next) => {
    let path = req.params;
    let captcha = "";
    const getUserPhone = () =>{
        return new Promise((resolve, reject) => {
            let queryUser = UserModel.find({});
            if(path.userId ){
                if(path.userId .length == 24){
                    queryUser.where('_id').equals(mongoose.mongo.ObjectId(path.userId ));
                }else{
                    logger.info('resetSms getUserPhone userId format incorrect!');
                    resUtil.resetQueryRes(res,[],null);
                    return next();
                }
            }
            if(path.phone){
                queryUser.where('phone').equals(path.phone);
            }
            queryUser.exec((error,rows)=> {
                if (error) {
                    logger.error(' resetSms getUserPhone ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' resetSms getUserPhone ' + 'success');
                    if(rows.length > 0){
                        resolve();
                    }else{
                        reject({msg:systemMsg.CUST_ID_NULL_ERROR});
                    }
                }
            });
        });
    }

    //保存验证码
    const savePhoneCode = () =>{
        return new Promise((resolve, reject) => {
            captcha = encrypt.getSmsRandomKey();
            console.log(captcha);
            oauthUtil.saveUserPhoneCode({phone:path.phone,code:captcha},function(error,result){
                if (error) {
                    logger.error(' resetSms savePhoneCode ' + error.message);
                    reject({msg:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else {
                    logger.info(' resetSms savePhoneCode ' + 'success');
                    resolve();
                }
            })
        });
    }

    //发送验证码
    const sendServerSms = () =>{
        return new Promise((resolve, reject) => {
            sendSms({phone:path.phone,captcha:captcha,templateId:smsConfig.smsOptions.signTemplateId},function (error,result) {
                if (error) {
                    logger.error(' resetSms sendServerSms ' + error.message);
                    reject({msg:systemMsg.SYS_INTERNAL_ERROR_MSG});
                } else {
                    logger.info(' resetSms sendServerSmsS ' + 'success');
                    resUtil.resetCreateRes(res,{_id:1},null);
                    return next();
                }
            })
        });
    }

    getUserPhone()
        .then(savePhoneCode)
        .then(sendServerSms)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
module.exports = {
    regSms,
    passwordSms,
    resetSms
};