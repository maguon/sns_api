"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('SysMsgController');

const {SysMsgModel} = require('../modules');
const {UserModel} = require('../modules');
const {InfoModel} = require('../modules');

const getSysMsg = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = SysMsgModel.find({});
    if(path.userId ){
        if(path.userId .length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getSysMsg userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.sysMsgId){
        if(params.sysMsgId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.sysMsgId));
        }else{
            logger.info('getSysMsg sysMsgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYS_MSG_ID_NULL_ERROR);
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
            logger.error(' getSysMsg ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getSysMsg ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createSysMsg = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let sysMsgObj = bodyParams;
    let returnMessage;
    sysMsgObj.status = sysConsts.SYSMSG.status.normal;

    //获取用户编号
    const getUserId = () =>{
        return new Promise((resolve, reject) => {

            //userId存在
            if(bodyParams.userId){
                resolve();
            }
            //只有phone时
            if((bodyParams.phone != null || bodyParams.phone != '' || bodyParams.phone != "undefined") && (bodyParams.userId == '' || bodyParams.userId == null ||  bodyParams.userId == "undefined")){
                let queryUser = UserModel.find({});
                if(bodyParams.phone){
                    queryUser.where('phone').equals(bodyParams.phone);
                }
                queryUser.exec((error,rows)=> {
                    if (error) {
                        logger.error(' createSysMsg getUserId ' + error.message);
                        reject({err:error.message});
                    } else {
                        logger.info(' createSysMsg getUserId ' + 'success');
                        if(rows.length > 0){
                            if(rows[0]._doc.status == sysConsts.USER.status.disable){
                                reject({msg:systemMsg.USER_STATUS_ERROR});
                            }else{
                                sysMsgObj._user_id = rows[0]._doc._id;
                                resolve();
                            }
                        }else{
                            reject({msg:systemMsg.CUST_ID_NULL_ERROR});
                        }
                    }
                });
            }
        });
    }
    //保存新系统消息
    const saveSysMsg = () =>{
        return new Promise((resolve, reject) => {
            if(path.adminId){
                if(path.adminId.length == 24){
                    sysMsgObj._admin_id = mongoose.mongo.ObjectId(path.adminId);
                }else{
                    logger.info('createSysMsg adminId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(sysMsgObj.userId){
                sysMsgObj._user_id = sysMsgObj.userId;
            }
            let sysMsgModel = new SysMsgModel(sysMsgObj);
            sysMsgModel.save(function(error,result){
                if (error) {
                    logger.error(' createSysMsg ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createSysMsg ' + 'success');
                    returnMessage = result;
                    resolve();
                }
            })
        });
    }
    //添加消息提醒
    const createInfo = () =>{
        return new Promise(()=>{
            let infoObj = bodyParams;
            let content ={};
            if(bodyParams.userId){
                if(bodyParams.userId.length == 24){
                    content._user_id = mongoose.mongo.ObjectId(bodyParams.userId);
                    content.txt =  " 有一条系统推送消息 ";
                }else{
                    logger.info(' createSysMsg userByID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            infoObj.type = sysConsts.INFO.type.sys;
            infoObj.status = sysConsts.INFO.status.unread;
            infoObj.content = content;
            let infoModel = new InfoModel(infoObj);
            infoModel.save(function(error,result){
                if (error) {
                    logger.error(' createSysMsg createInfo ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createSysMsg createInfo ' + 'success');
                    resUtil.resetCreateRes(res, returnMessage);
                    return next();
                }
            })
        });
    }
    getUserId()
        .then(saveSysMsg)
        .then(createInfo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const getSysMsgByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_infos",
                localField: "_user_id",
                foreignField: "_id",
                as: "user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "user_detail_info"
            }
        },
        {
            $lookup: {
                from: "admin_users",
                localField: "_admin_id",
                foreignField: "_id",
                as: "admin_info"
            }
        }
    )
    if(params.publisherId){
        if(params.publisherId.length == 24){
            matchObj._admin_id = mongoose.mongo.ObjectId(params.publisherId);
        }else{
            logger.info('getSysMsgByAdmin publisherId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userId){
        if(params.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getSysMsgByAdmin userId format incorrect!');
            resUtil.resetQueryRes(res,[],systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.sysMsgId){
        if(params.sysMsgId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.sysMsgId);
        }else{
            logger.info('getSysMsgByAdmin sysMsgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYS_MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.status){
        matchObj.status = Number(params.status);
    }
    if(params.type){
        matchObj.type = Number(params.type);
    }
    if (params.createDateStart && params.createDateEnd ){
        matchObj.created_at = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    //根据phone查询用户ID
    const getUserId = () =>{
        return new Promise((resolve, reject) => {
            //判断查询条件中 是否存在电话号
            if(params.phone){
                let queryUser = UserModel.find({});
                if(params.phone){
                    queryUser.where('phone').equals(params.phone);
                }
                queryUser.exec((error,rows)=> {
                    if (error) {
                        logger.error(' getSysMsgByAdmin getUserId ' + error.message);
                        reject({err:error.message});
                    } else {
                        logger.info(' getSysMsgByAdmin getUserId ' + 'success');
                        if(rows.length > 0){
                            matchObj._user_id = mongoose.mongo.ObjectId(rows[0]._doc._id);
                            resolve();
                        }else{
                            resolve();
                        }
                    }
                });
            }else{
                resolve();
            }
        });
    }

    const getSysMsg =()=>{
        return new Promise(() => {
            aggregate_limit.push({
                $match: matchObj
            });

            if (params.start && params.size){
                aggregate_limit.push(
                    {
                        $skip : Number(params.start)
                    },{
                        $limit : Number(params.size)
                    }
                );
            };
            aggregate_limit.push({
                $project: {
                    "user_login_info.password": 0,
                    "admin_info.password": 0
                }
            });
            SysMsgModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' getSysMsgByAdmin getSysMsg ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getSysMsgByAdmin getSysMsg ' + 'success');
                    resUtil.resetQueryRes(res, rows);
                    return next();
                }
            });
        });
    }

    getUserId()
        .then(getSysMsg)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const updateStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    let query = SysMsgModel.find({});
    if(path.sysMsgId){
        if(path.sysMsgId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.sysMsgId));
        }else{
            logger.info('updateStatusByAdmin  sysMsgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYS_MSG_ID_NULL_ERROR);
            return next();
        }
    }
    SysMsgModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const deleteSysMsg = (req, res, next) => {
    let path = req.params;
    let query = SysMsgModel.find({});
    if(path.sysMsgId){
        if(path.sysMsgId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.sysMsgId));
        }else{
            logger.info(' deleteApp sysMsgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYS_MSG_ID_NULL_ERROR);
            return next();
        }
    }
    SysMsgModel.deleteOne(query,function(error,result){
        if(error){
            logger.error(' deleteSysMsg ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info(' deleteSysMsg ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getSysMsg,
    createSysMsg,
    getSysMsgByAdmin,
    updateStatusByAdmin,
    deleteSysMsg
};