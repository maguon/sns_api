"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('SystemMessageController');

const {SystemMessageModel} = require('../modules');
const {UserModel} = require('../modules');

const getSystemMessage = (req, res, next) => {
    let params = req.query;
    let query = SystemMessageModel.find({});
    if(params.publisherId){
        if(params.publisherId.length == 24){
            query.where('_adminId').equals(mongoose.mongo.ObjectId(params.publisherId));
        }else{
            logger.info('getSystemMessage publisherId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.systemMessageId){
        if(params.systemMessageId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.vsystemMessageIdoteId));
        }else{
            logger.info('getSystemMessage voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYSTEM_MESSAGE_ID_NULL_ERROR);
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
            logger.error(' getSystemMessage ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getSystemMessage ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createSystemMessage = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let systemMessageObj = bodyParams;
    systemMessageObj.status = sysConsts.SYSMESSAGE.status.normal;

    //获取用户编号
    const getUserId = () =>{
        return new Promise((resolve, reject) => {

            //userId存在
            if(bodyParams._userId){
                resolve();
            }
            //只有phone时
            if((bodyParams.phone != null || bodyParams.phone != '' || bodyParams.phone != "undefined") && (bodyParams._userId == '' || bodyParams._userId == null ||  bodyParams._userId == "undefined")){
                let queryUser = UserModel.find({});
                if(bodyParams.phone){
                    queryUser.where('phone').equals(bodyParams.phone);
                }
                queryUser.exec((error,rows)=> {
                    if (error) {
                        logger.error(' createSystemMessage getUserId ' + error.message);
                        reject({err:error.message});
                    } else {
                        logger.info(' createSystemMessage getUserId ' + 'success');
                        if(rows.length > 0){
                            if(rows[0]._doc.status == sysConsts.USER.status.disable){
                                reject({msg:systemMsg.USER_STATUS_ERROR});
                            }else{
                                systemMessageObj._userId = rows[0]._doc._id;
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
            if(params.adminId){
                if(params.adminId.length == 24){
                    systemMessageObj._adminId = mongoose.mongo.ObjectId(params.adminId);
                }else{
                    logger.info('createSystemMessage adminId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            let systemMessageModel = new SystemMessageModel(systemMessageObj);
            systemMessageModel.save(function(error,result){
                if (error) {
                    logger.error(' createSystemMessage ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createSystemMessage ' + 'success');
                    resUtil.resetCreateRes(res, result);
                    return next();
                }
            })
        });
    }

    getUserId()
        .then(saveSysMsg)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const getSystemMessageByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_infos",
                localField: "_userId",
                foreignField: "_id",
                as: "user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_userId",
                foreignField: "_userId",
                as: "user_detail_info"
            }
        },
        {
            $lookup: {
                from: "admin_users",
                localField: "_adminId",
                foreignField: "_id",
                as: "admin_info"
            }
        }
    )
    if(params.publisherId){
        if(params.publisherId.length == 24){
            matchObj._adminId = mongoose.mongo.ObjectId(params.publisherId);
        }else{
            logger.info('getSystemMessageByAdmin publisherId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userId){
        if(params.userId.length == 24){
            matchObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getSystemMessageByAdmin userId format incorrect!');
            resUtil.resetQueryRes(res,[],systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.systemMessageId){
        if(params.systemMessageId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.systemMessageId);
        }else{
            logger.info('getSystemMessageByAdmin systemMessageId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYSTEM_MESSAGE_ID_NULL_ERROR);
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
                        logger.error(' getSystemMessageByAdmin getUserId ' + error.message);
                        reject({err:error.message});
                    } else {
                        logger.info(' getSystemMessageByAdmin getUserId ' + 'success');
                        if(rows.length > 0){
                            matchObj._userId = mongoose.mongo.ObjectId(rows[0]._doc._id);
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

    const getSystemMessage =()=>{
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
            SystemMessageModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' getSystemMessageByAdmin getSystemMessage ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getSystemMessageByAdmin getSystemMessage ' + 'success');
                    resUtil.resetQueryRes(res, rows);
                    return next();
                }
            });
        });
    }

    getUserId()
        .then(getSystemMessage)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const updateStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let params = req.params;
    let query = SystemMessageModel.find({});
    if(params.systemMessageId){
        if(params.messageCommentsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.systemMessageId));
        }else{
            logger.info('updateStatusByAdmin  systemMessageId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYSTEM_MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    SystemMessageModel.updateOne(query,bodyParams,function(error,result){
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
const deleteSystemMessage = (req, res, next) => {
    let path = req.path;
    let query = SystemMessageModel.find({});
    if(path.systemMessageId){
        if(path.systemMessageId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.systemMessageId));
        }else{
            logger.info(' deleteApp systemMessageId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.SYSTEM_MESSAGE_ID_NULL_ERROR);
            return next();
        }
    }
    SystemMessageModel.deleteOne(query,function(error,result){
        if(error){
            logger.error(' deleteSystemMessage ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info(' deleteSystemMessage ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getSystemMessage,
    createSystemMessage,
    getSystemMessageByAdmin,
    updateStatusByAdmin,
    deleteSystemMessage
};